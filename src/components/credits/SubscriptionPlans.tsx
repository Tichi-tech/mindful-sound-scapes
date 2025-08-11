import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCredits } from '@/hooks/useCredits';
import { toast } from 'sonner';

interface SubscriptionPlan {
  id: string;
  name: string;
  daily_credits: number;
  price_monthly: number;
  price_yearly: number;
  features: any;
  is_active: boolean;
}

export const SubscriptionPlans: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { creditInfo } = useCredits();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return <Sparkles className="w-6 h-6" />;
      case 'pro':
        return <Zap className="w-6 h-6" />;
      case 'enterprise':
        return <Crown className="w-6 h-6" />;
      default:
        return <Sparkles className="w-6 h-6" />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return 'bg-gray-50 border-gray-200';
      case 'pro':
        return 'bg-blue-50 border-blue-200 ring-2 ring-blue-200';
      case 'enterprise':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const isCurrentPlan = (planName: string) => {
    return creditInfo?.subscription?.plan_name === planName;
  };

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(0)}`;
  };

  const handleUpgrade = (plan: SubscriptionPlan) => {
    if (plan.name === 'Free') return;
    
    // TODO: Implement Stripe integration
    toast.info('Subscription management coming soon!');
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="space-y-4">
              <div className="w-16 h-6 bg-muted rounded" />
              <div className="w-20 h-8 bg-muted rounded" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="w-full h-4 bg-muted rounded" />
                ))}
              </div>
              <div className="w-full h-10 bg-muted rounded" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Choose Your Plan</h2>
        <p className="text-muted-foreground">
          Upgrade your account to unlock unlimited generations and premium features
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`p-6 relative ${getPlanColor(plan.name)} ${
              isCurrentPlan(plan.name) ? 'ring-2 ring-primary' : ''
            }`}
          >
            {isCurrentPlan(plan.name) && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                Current Plan
              </Badge>
            )}

            {plan.name === 'Pro' && (
              <Badge variant="secondary" className="absolute -top-2 right-4">
                Most Popular
              </Badge>
            )}

            <div className="space-y-4">
              {/* Plan Header */}
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  {getPlanIcon(plan.name)}
                </div>
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="mt-2">
                  {plan.price_monthly === 0 ? (
                    <span className="text-2xl font-bold">Free</span>
                  ) : (
                    <div>
                      <span className="text-2xl font-bold">
                        {formatPrice(plan.price_monthly)}
                      </span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Credits */}
              <div className="text-center">
                <div className="text-lg font-semibold">
                  {plan.daily_credits === -1 ? 'Unlimited' : plan.daily_credits} 
                  {plan.daily_credits !== -1 && ' daily'} credits
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">
                    Max duration: {plan.features?.max_duration || '10min'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">
                    Audio quality: {plan.features?.quality || 'Standard'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">
                    Generation priority: {plan.features?.priority || 'Standard'}
                  </span>
                </div>
                {plan.features?.analytics && (
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Advanced analytics</span>
                  </div>
                )}
                {plan.features?.unlimited_generations && (
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Unlimited generations</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <Button 
                onClick={() => handleUpgrade(plan)}
                disabled={isCurrentPlan(plan.name) || plan.name === 'Free'}
                variant={plan.name === 'Pro' ? 'default' : 'outline'}
                className="w-full"
              >
                {isCurrentPlan(plan.name) 
                  ? 'Current Plan' 
                  : plan.name === 'Free' 
                    ? 'Get Started' 
                    : `Upgrade to ${plan.name}`
                }
              </Button>

              {/* Yearly Savings */}
              {plan.price_yearly > 0 && plan.price_monthly > 0 && (
                <div className="text-center text-xs text-muted-foreground">
                  Save {Math.round((1 - (plan.price_yearly / 12) / plan.price_monthly) * 100)}% 
                  with yearly billing
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>All plans include access to our full library of healing music and guided meditations.</p>
        <p className="mt-1">Upgrade or cancel anytime. No hidden fees.</p>
      </div>
    </div>
  );
};