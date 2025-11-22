import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { getUserSubscription } from '../lib/stripe';
import { getProductByPriceId } from '../stripe-config';
import { Card, CardContent } from './ui/Card';
import { Crown, Calendar, CreditCard } from 'lucide-react';

interface SubscriptionStatusProps {
  className?: string;
}

export default function SubscriptionStatus({ className }: SubscriptionStatusProps) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSubscription();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadSubscription = async () => {
    try {
      const sub = await getUserSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) {
    return null;
  }

  if (!subscription || !subscription.price_id || subscription.subscription_status !== 'active') {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <Crown className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Free Plan</p>
              <p className="text-sm text-gray-600">Upgrade to unlock premium features</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const product = getProductByPriceId(subscription.price_id);
  const periodEnd = subscription.current_period_end 
    ? new Date(subscription.current_period_end * 1000).toLocaleDateString()
    : null;

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Crown className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">
              {product?.name || 'Premium Plan'}
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              {periodEnd && (
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Renews {periodEnd}</span>
                </div>
              )}
              {subscription.payment_method_last4 && (
                <div className="flex items-center space-x-1">
                  <CreditCard className="w-4 h-4" />
                  <span>•••• {subscription.payment_method_last4}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}