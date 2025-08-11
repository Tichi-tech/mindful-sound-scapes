import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Coins, Clock, Sparkles, RefreshCw } from 'lucide-react';
import { useCredits } from '@/hooks/useCredits';
import { toast } from 'sonner';

interface CreditDisplayProps {
  showDetails?: boolean;
  compact?: boolean;
}

export const CreditDisplay: React.FC<CreditDisplayProps> = ({ 
  showDetails = true, 
  compact = false 
}) => {
  const { creditInfo, loading, refreshCredits, getTimeUntilReset } = useCredits();

  const handleRefresh = async () => {
    try {
      await refreshCredits();
      toast.success('Credits refreshed');
    } catch (error) {
      toast.error('Failed to refresh credits');
    }
  };

  if (!creditInfo) {
    return (
      <Card className={`p-4 ${compact ? 'p-3' : ''}`}>
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-primary" />
          <span className="font-medium">Credits</span>
          {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
        </div>
        <div className="text-2xl font-bold text-muted-foreground">---</div>
      </Card>
    );
  }

  const timeUntilReset = getTimeUntilReset();
  const dailyCredits = creditInfo.subscription?.daily_credits || 300;
  const isUnlimited = dailyCredits === -1;
  const progressPercentage = isUnlimited ? 100 : (creditInfo.current_credits / dailyCredits) * 100;

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border">
        <Coins className="w-4 h-4 text-primary" />
        <span className="font-medium">
          {isUnlimited ? '∞' : creditInfo.current_credits}
        </span>
        {!isUnlimited && (
          <span className="text-muted-foreground">/{dailyCredits}</span>
        )}
        {creditInfo.subscription?.plan_name !== 'Free' && (
          <Badge variant="secondary" className="text-xs">
            {creditInfo.subscription?.plan_name}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            <span className="font-medium">Daily Credits</span>
            {creditInfo.subscription?.plan_name !== 'Free' && (
              <Badge variant="secondary" className="ml-2">
                <Sparkles className="w-3 h-3 mr-1" />
                {creditInfo.subscription?.plan_name}
              </Badge>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Credit Count */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              {isUnlimited ? '∞' : creditInfo.current_credits}
            </span>
            {!isUnlimited && (
              <span className="text-lg text-muted-foreground">
                / {dailyCredits}
              </span>
            )}
          </div>
          
          {!isUnlimited && (
            <Progress 
              value={progressPercentage} 
              className="h-2"
            />
          )}
        </div>

        {/* Additional Details */}
        {showDetails && (
          <div className="space-y-2 text-sm text-muted-foreground">
            {/* Reset Timer */}
            {timeUntilReset && !isUnlimited && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  Resets in {timeUntilReset.hours}h {timeUntilReset.minutes}m
                </span>
              </div>
            )}

            {/* Credit Usage Info */}
            <div className="text-xs space-y-1">
              <div>• Guided Meditation: 50-250 credits</div>
              <div>• Healing Music: 75-375 credits</div>
              <div className="text-primary">* Cost varies by duration</div>
            </div>

            {/* Upgrade Hint for Free Users */}
            {creditInfo.subscription?.plan_name === 'Free' && creditInfo.current_credits < 100 && (
              <div className="mt-3 p-3 bg-primary/10 rounded-lg">
                <div className="text-primary font-medium text-sm">
                  Running low on credits?
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Upgrade to Pro for unlimited daily generations
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};