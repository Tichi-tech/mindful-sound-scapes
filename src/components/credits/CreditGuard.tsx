import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { useCredits } from '@/hooks/useCredits';

interface CreditGuardProps {
  requiredCredits: number;
  generationType: 'meditation' | 'music';
  duration?: string;
  onUpgrade?: () => void;
  children: React.ReactNode;
}

export const CreditGuard: React.FC<CreditGuardProps> = ({
  requiredCredits,
  generationType,
  duration,
  onUpgrade,
  children
}) => {
  const { creditInfo, hasCredits, getTimeUntilReset } = useCredits();

  if (!creditInfo) {
    return <div className="animate-pulse">{children}</div>;
  }

  const canGenerate = hasCredits(requiredCredits);
  const timeUntilReset = getTimeUntilReset();
  const isUnlimited = creditInfo.subscription?.daily_credits === -1;

  if (canGenerate || isUnlimited) {
    return <>{children}</>;
  }

  return (
    <Card className="p-6 border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
            Insufficient Credits
          </h3>
          <p className="text-orange-700 dark:text-orange-300">
            You need <Badge variant="outline" className="mx-1">{requiredCredits} credits</Badge> 
            to generate this {generationType}
            {duration && ` (${duration})`}.
          </p>
          <p className="text-sm text-orange-600 dark:text-orange-400">
            Current balance: <span className="font-medium">{creditInfo.current_credits} credits</span>
          </p>
        </div>

        {/* Reset Timer */}
        {timeUntilReset && (
          <div className="flex items-center justify-center gap-2 text-sm text-orange-600 dark:text-orange-400">
            <Clock className="w-4 h-4" />
            <span>
              Credits reset in {timeUntilReset.hours}h {timeUntilReset.minutes}m
            </span>
          </div>
        )}

        {/* Upgrade Options */}
        <div className="space-y-3 pt-4 border-t border-orange-200 dark:border-orange-800">
          <div className="text-sm text-orange-700 dark:text-orange-300">
            Get unlimited daily generations with Pro
          </div>
          
          <div className="flex justify-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onUpgrade}
              className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-900/30"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Upgrade to Pro
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="text-xs text-orange-600 dark:text-orange-400">
            Or wait for your daily credits to reset
          </div>
        </div>
      </div>
    </Card>
  );
};