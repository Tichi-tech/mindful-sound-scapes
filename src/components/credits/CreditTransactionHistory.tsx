import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowUp, ArrowDown, Gift, RotateCcw, History } from 'lucide-react';
import { useCredits } from '@/hooks/useCredits';
import { formatDistanceToNow } from 'date-fns';

export const CreditTransactionHistory: React.FC = () => {
  const { transactions, loading } = useCredits();

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'allocation':
        return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'deduction':
        return <ArrowDown className="w-4 h-4 text-red-500" />;
      case 'bonus':
        return <Gift className="w-4 h-4 text-purple-500" />;
      case 'refund':
        return <RotateCcw className="w-4 h-4 text-blue-500" />;
      default:
        return <History className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'allocation':
        return 'text-green-600';
      case 'deduction':
        return 'text-red-600';
      case 'bonus':
        return 'text-purple-600';
      case 'refund':
        return 'text-blue-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getTransactionVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case 'allocation':
        return 'default';
      case 'deduction':
        return 'destructive';
      case 'bonus':
        return 'secondary';
      case 'refund':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5" />
          <span className="font-medium">Transaction History</span>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-2 border rounded animate-pulse">
              <div className="w-8 h-8 bg-muted rounded-full" />
              <div className="flex-1 space-y-1">
                <div className="w-24 h-4 bg-muted rounded" />
                <div className="w-32 h-3 bg-muted rounded" />
              </div>
              <div className="w-16 h-4 bg-muted rounded" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5" />
        <span className="font-medium">Transaction History</span>
        <Badge variant="outline" className="ml-auto">
          {transactions.length} transactions
        </Badge>
      </div>

      <ScrollArea className="h-96">
        <div className="space-y-2">
          {transactions.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <div>No transactions yet</div>
              <div className="text-xs">Your credit activity will appear here</div>
            </div>
          ) : (
            transactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0">
                  {getTransactionIcon(transaction.transaction_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getTransactionVariant(transaction.transaction_type)} className="text-xs">
                      {transaction.transaction_type}
                    </Badge>
                    <span className={`font-medium ${getTransactionColor(transaction.transaction_type)}`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                    </span>
                  </div>
                  
                  <div className="text-sm text-muted-foreground truncate">
                    {transaction.reason || 'No description'}
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                  </div>
                </div>
                
                <div className="flex-shrink-0 text-right">
                  <div className="text-sm font-medium">
                    {transaction.remaining_credits}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    remaining
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};