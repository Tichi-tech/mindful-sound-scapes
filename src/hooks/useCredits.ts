import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface CreditInfo {
  current_credits: number;
  needs_reset: boolean;
  subscription: {
    plan_name: string;
    daily_credits: number;
    features: any;
  } | null;
  next_reset_time: string | null;
}

export interface CreditTransaction {
  id: string;
  transaction_type: string;
  amount: number;
  reason: string | null;
  remaining_credits: number;
  created_at: string;
  session_id?: string | null;
  track_id?: string | null;
  user_id: string;
}

export const useCredits = () => {
  const { user } = useAuth();
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check and refresh credits
  const refreshCredits = useCallback(async () => {
    if (!user) {
      setCreditInfo(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('check-credits');
      
      if (error) {
        throw new Error(error.message);
      }

      setCreditInfo(data);
      
      if (data.needs_reset) {
        toast.success('Your daily credits have been refreshed!');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check credits';
      setError(errorMessage);
      console.error('Error checking credits:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load transaction history
  const loadTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        throw new Error(error.message);
      }

      setTransactions(data || []);
    } catch (err) {
      console.error('Error loading transactions:', err);
    }
  }, [user]);

  // Deduct credits
  const deductCredits = useCallback(async (
    amount: number, 
    reason?: string, 
    sessionId?: string, 
    trackId?: string
  ) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase.functions.invoke('deduct-credits', {
      body: {
        amount,
        reason,
        session_id: sessionId,
        track_id: trackId
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.error) {
      throw new Error(data.error);
    }

    // Refresh credits after deduction
    await refreshCredits();
    await loadTransactions();

    return data;
  }, [user, refreshCredits, loadTransactions]);

  // Refund credits (for failed generations)
  const refundCredits = useCallback(async (
    amount: number, 
    reason?: string, 
    sessionId?: string, 
    trackId?: string
  ) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase.functions.invoke('refund-credits', {
      body: {
        amount,
        reason,
        session_id: sessionId,
        track_id: trackId
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    // Refresh credits after refund
    await refreshCredits();
    await loadTransactions();

    return data;
  }, [user, refreshCredits, loadTransactions]);

  // Check if user has enough credits
  const hasCredits = useCallback((requiredAmount: number) => {
    return creditInfo ? creditInfo.current_credits >= requiredAmount : false;
  }, [creditInfo]);

  // Get cost for different generation types
  const getGenerationCost = useCallback((type: 'meditation' | 'music', duration?: string) => {
    // Base costs in credits
    const baseCosts = {
      meditation: 50,  // Base cost for meditation
      music: 75       // Base cost for music
    };

    // Duration multipliers
    const durationMultipliers: { [key: string]: number } = {
      '5min': 1,
      '10min': 1.5,
      '15min': 2,
      '20min': 2.5,
      '30min': 3,
      '45min': 4,
      '60min': 5
    };

    const baseCost = baseCosts[type];
    const multiplier = duration ? (durationMultipliers[duration] || 1) : 1;
    
    return Math.round(baseCost * multiplier);
  }, []);

  // Calculate time until next reset
  const getTimeUntilReset = useCallback(() => {
    if (!creditInfo?.next_reset_time) return null;

    const resetTime = new Date(creditInfo.next_reset_time);
    const now = new Date();
    const diffMs = resetTime.getTime() - now.getTime();

    if (diffMs <= 0) return null;

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return { hours, minutes };
  }, [creditInfo]);

  // Initialize credits on mount and user change
  useEffect(() => {
    if (user) {
      refreshCredits();
      loadTransactions();
    } else {
      setCreditInfo(null);
      setTransactions([]);
    }
  }, [user, refreshCredits, loadTransactions]);

  // Set up real-time updates for credit changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('credit-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_credits',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Refresh credits when they change
          refreshCredits();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'credit_transactions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Refresh transactions when new ones are added
          loadTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refreshCredits, loadTransactions]);

  return {
    creditInfo,
    transactions,
    loading,
    error,
    refreshCredits,
    loadTransactions,
    deductCredits,
    refundCredits,
    hasCredits,
    getGenerationCost,
    getTimeUntilReset
  };
};