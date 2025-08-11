-- Create user credits table
CREATE TABLE public.user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_credits INTEGER NOT NULL DEFAULT 300,
  daily_allocation INTEGER NOT NULL DEFAULT 300,
  total_credits_used INTEGER NOT NULL DEFAULT 0,
  last_reset_at TIMESTAMPTZ,
  first_action_today TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create credit transactions table for audit logging
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('allocation', 'deduction', 'bonus', 'refund')),
  amount INTEGER NOT NULL,
  reason TEXT,
  session_id UUID,
  track_id UUID,
  remaining_credits INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  daily_credits INTEGER NOT NULL,
  price_monthly INTEGER, -- in cents
  price_yearly INTEGER, -- in cents
  features JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'cancelled', 'expired')),
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_credits
CREATE POLICY "Users can view their own credits" ON public.user_credits
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits" ON public.user_credits
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Edge functions can manage credits" ON public.user_credits
FOR ALL USING (true);

-- RLS Policies for credit_transactions
CREATE POLICY "Users can view their own transactions" ON public.credit_transactions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Edge functions can create transactions" ON public.credit_transactions
FOR INSERT WITH CHECK (true);

-- RLS Policies for subscription_plans
CREATE POLICY "Plans are viewable by everyone" ON public.subscription_plans
FOR SELECT USING (true);

CREATE POLICY "Admins can manage plans" ON public.subscription_plans
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscription" ON public.user_subscriptions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Edge functions can manage subscriptions" ON public.user_subscriptions
FOR ALL USING (true);

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, daily_credits, price_monthly, price_yearly, features) VALUES
('Free', 300, 0, 0, '{"max_duration": "10min", "quality": "standard", "priority": "low"}'),
('Pro', 3000, 999, 9990, '{"max_duration": "60min", "quality": "premium", "priority": "high", "unlimited_generations": false}'),
('Enterprise', -1, 2999, 29990, '{"max_duration": "unlimited", "quality": "premium", "priority": "highest", "unlimited_generations": true, "analytics": true}');

-- Function to initialize user credits
CREATE OR REPLACE FUNCTION public.initialize_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, current_credits, daily_allocation)
  VALUES (NEW.user_id, 300, 300);
  
  -- Also create default subscription to free plan
  INSERT INTO public.user_subscriptions (user_id, plan_id, status)
  VALUES (NEW.user_id, (SELECT id FROM subscription_plans WHERE name = 'Free'), 'active');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to initialize credits when profile is created
CREATE TRIGGER on_profile_created_initialize_credits
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_credits();

-- Function to check and reset credits (rolling 24-hour)
CREATE OR REPLACE FUNCTION public.check_and_reset_credits(p_user_id UUID)
RETURNS TABLE(current_credits INTEGER, needs_reset BOOLEAN) AS $$
DECLARE
  user_credits_record RECORD;
  hours_since_first_action INTERVAL;
  needs_reset_flag BOOLEAN := false;
BEGIN
  -- Get current user credits
  SELECT * INTO user_credits_record 
  FROM public.user_credits 
  WHERE user_id = p_user_id;
  
  -- If no record exists, create one
  IF user_credits_record IS NULL THEN
    INSERT INTO public.user_credits (user_id, current_credits, daily_allocation, first_action_today)
    VALUES (p_user_id, 300, 300, now())
    RETURNING * INTO user_credits_record;
    needs_reset_flag := true;
  ELSE
    -- Check if 24 hours have passed since first action today
    IF user_credits_record.first_action_today IS NOT NULL THEN
      hours_since_first_action := now() - user_credits_record.first_action_today;
      
      -- If more than 24 hours have passed, reset credits
      IF EXTRACT(EPOCH FROM hours_since_first_action) >= 86400 THEN -- 24 hours in seconds
        UPDATE public.user_credits 
        SET 
          current_credits = daily_allocation,
          first_action_today = now(),
          last_reset_at = now(),
          updated_at = now()
        WHERE user_id = p_user_id
        RETURNING * INTO user_credits_record;
        
        needs_reset_flag := true;
        
        -- Log the credit allocation
        INSERT INTO public.credit_transactions (
          user_id, transaction_type, amount, reason, remaining_credits
        ) VALUES (
          p_user_id, 'allocation', user_credits_record.daily_allocation, 
          'Daily credit reset (24h rolling)', user_credits_record.current_credits
        );
      END IF;
    ELSE
      -- First action ever, set the timestamp
      UPDATE public.user_credits 
      SET first_action_today = now(), updated_at = now()
      WHERE user_id = p_user_id
      RETURNING * INTO user_credits_record;
    END IF;
  END IF;
  
  -- Return current credits and reset status
  RETURN QUERY SELECT user_credits_record.current_credits, needs_reset_flag;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;