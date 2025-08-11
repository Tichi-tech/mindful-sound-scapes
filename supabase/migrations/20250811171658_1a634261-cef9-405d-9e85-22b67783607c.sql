-- First, let's check and fix the user creation triggers

-- Drop the existing trigger and function to recreate them properly
DROP TRIGGER IF EXISTS on_profile_created_initialize_credits ON public.profiles;
DROP FUNCTION IF EXISTS public.initialize_user_credits();

-- Recreate the function with better error handling
CREATE OR REPLACE FUNCTION public.initialize_user_credits()
RETURNS TRIGGER AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  -- Get the free plan ID
  SELECT id INTO free_plan_id 
  FROM public.subscription_plans 
  WHERE name = 'Free' 
  LIMIT 1;
  
  -- If no free plan exists, create one
  IF free_plan_id IS NULL THEN
    INSERT INTO public.subscription_plans (name, daily_credits, price_monthly, price_yearly, features, is_active)
    VALUES ('Free', 300, 0, 0, '{"max_duration": "10min", "quality": "standard", "priority": "low"}', true)
    RETURNING id INTO free_plan_id;
  END IF;
  
  -- Initialize user credits (only if not already exists)
  INSERT INTO public.user_credits (user_id, current_credits, daily_allocation)
  VALUES (NEW.user_id, 300, 300)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create default subscription to free plan (only if not already exists)
  INSERT INTO public.user_subscriptions (user_id, plan_id, status)
  VALUES (NEW.user_id, free_plan_id, 'active')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_profile_created_initialize_credits
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_credits();

-- Also ensure the profile creation trigger exists and works
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Make sure the profile creation trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();