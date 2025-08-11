import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditDisplay } from './CreditDisplay';
import { CreditTransactionHistory } from './CreditTransactionHistory';
import { SubscriptionPlans } from './SubscriptionPlans';

export const AccountManagement: React.FC = () => {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Account Management</h1>
        <p className="text-muted-foreground">
          Manage your credits, subscription, and account settings
        </p>
      </div>

      <Tabs defaultValue="credits" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="credits">Credits & Usage</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="credits" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <CreditDisplay showDetails={true} />
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Generation Costs</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Guided Meditation (5min)</span>
                  <span className="font-medium">50 credits</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Guided Meditation (10min)</span>
                  <span className="font-medium">75 credits</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Guided Meditation (15min)</span>
                  <span className="font-medium">100 credits</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Guided Meditation (20min)</span>
                  <span className="font-medium">125 credits</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Healing Music (5min)</span>
                    <span className="font-medium">75 credits</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Healing Music (10min)</span>
                    <span className="font-medium">115 credits</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Healing Music (15min)</span>
                    <span className="font-medium">150 credits</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Healing Music (20min)</span>
                    <span className="font-medium">190 credits</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">
                  * Longer durations require more processing power and credits
                </p>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <SubscriptionPlans />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <CreditTransactionHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};