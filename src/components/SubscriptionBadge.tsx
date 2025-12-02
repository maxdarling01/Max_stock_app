import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserSubscription } from '../services/subscriptionService';
import type { Subscription } from '../services/subscriptionService';

export default function SubscriptionBadge() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubscription = async () => {
      if (user) {
        const sub = await getUserSubscription(user.id);
        setSubscription(sub);
      }
      setLoading(false);
    };

    loadSubscription();
  }, [user]);

  if (!user || loading) {
    return null;
  }

  if (!subscription || subscription.plan_type === 'none') {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-300">Free Plan</span>
        <Link
          to="/pricing"
          className="px-3 py-1 border border-yellow-500 text-yellow-500 rounded-lg text-sm hover:bg-yellow-500 hover:text-black transition-colors"
        >
          Subscribe
        </Link>
      </div>
    );
  }

  const isLegendary = subscription.plan_type === 'legendary';
  const downloadsDisplay = isLegendary ? 'Unlimited' : `${subscription.downloads_remaining}`;

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all hover:bg-opacity-10"
        style={{
          borderColor: '#d4af37',
          color: '#d4af37',
        }}
      >
        <div className="text-left">
          <div className="text-sm font-semibold capitalize">{subscription.plan_type}</div>
          <div className="text-xs text-gray-400">{downloadsDisplay} downloads</div>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-gray-900 rounded-lg border-2 shadow-lg z-50" style={{ borderColor: '#d4af37' }}>
          <div className="p-4 space-y-4">
            <div>
              <h3 className="font-semibold text-white mb-2">Current Plan</h3>
              <div className="space-y-1 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Plan Type:</span>
                  <span className="font-semibold capitalize" style={{ color: '#d4af37' }}>
                    {subscription.plan_type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Downloads:</span>
                  <span className="font-semibold">
                    {isLegendary ? 'Unlimited' : `${subscription.downloads_remaining} remaining`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Renewal Date:</span>
                  <span className="font-semibold">
                    {new Date(subscription.current_period_end).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-4 flex gap-2">
              <Link
                to="/pricing"
                className="flex-1 py-2 px-3 rounded-lg font-medium text-center transition-all hover:shadow-lg"
                style={{ backgroundColor: '#d4af37', color: '#000' }}
                onClick={() => setDropdownOpen(false)}
              >
                Upgrade Plan
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
