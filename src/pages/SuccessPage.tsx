import { CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function SuccessPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activating, setActivating] = useState(true);
  const [error, setError] = useState('');
  const [planDetails, setPlanDetails] = useState<{
    planType: string;
    downloadsRemaining: number;
    periodEnd: string;
  } | null>(null);

  useEffect(() => {
    const activateSubscription = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('session_id');

        if (!sessionId) {
          throw new Error('No session ID found');
        }

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/activate-subscription`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ sessionId }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to activate subscription');
        }

        const data = await response.json();
        setPlanDetails(data);

        navigate('/home');
      } catch (err) {
        console.error('Activation error:', err);
        setError(err instanceof Error ? err.message : 'Failed to activate subscription');
        setActivating(false);
      }
    };

    if (user) {
      activateSubscription();
    }
  }, [user, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-8">
            <AlertCircle className="w-20 h-20 mx-auto" style={{ color: '#d4af37' }} />
          </div>

          <h1 className="text-4xl font-bold mb-4" style={{ color: '#d4af37' }}>
            Activation Error
          </h1>

          <p className="text-lg text-gray-300 mb-8">
            {error}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all"
              style={{ backgroundColor: '#d4af37', color: '#000' }}
            >
              Back to Pricing
            </Link>
            <Link
              to="/home"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 rounded-lg font-semibold text-white hover:bg-white hover:text-black transition-all"
              style={{ borderColor: '#d4af37' }}
            >
              Browse Assets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (activating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-8">
            <div className="w-16 h-16 border-4 border-gray-700 border-t-yellow-500 rounded-full animate-spin mx-auto"></div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Activating Your Subscription
          </h1>
          <p className="text-lg text-gray-300">
            Please wait while we process your payment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8 relative">
          <div className="w-32 h-32 mx-auto rounded-full flex items-center justify-center animate-pulse" style={{ backgroundColor: '#d4af37' }}>
            <CheckCircle className="w-20 h-20 text-black" />
          </div>
          <div className="absolute inset-0 w-32 h-32 mx-auto rounded-full animate-ping opacity-20" style={{ backgroundColor: '#d4af37' }}></div>
        </div>

        <h1 className="text-5xl font-bold mb-6" style={{ color: '#d4af37' }}>
          Payment Successful!
        </h1>

        <p className="text-2xl text-white mb-2">
          Your {planDetails?.planType} plan is now active
        </p>

        <p className="text-lg text-gray-400 mb-8">
          {planDetails?.downloadsRemaining === 999999
            ? 'Unlimited downloads per month'
            : `${planDetails?.downloadsRemaining} downloads available this month`}
        </p>

        <div className="mb-8 p-6 bg-gray-900 rounded-lg border-2" style={{ borderColor: '#d4af37' }}>
          <h3 className="text-lg font-semibold text-white mb-4">Plan Details</h3>
          <div className="text-left space-y-3 text-gray-300">
            <div className="flex justify-between">
              <span>Plan:</span>
              <span className="font-semibold capitalize" style={{ color: '#d4af37' }}>{planDetails?.planType}</span>
            </div>
            <div className="flex justify-between">
              <span>Downloads:</span>
              <span className="font-semibold">
                {planDetails?.downloadsRemaining === 999999 ? 'Unlimited' : `${planDetails?.downloadsRemaining} this month`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Next Billing:</span>
              <span className="font-semibold">
                {planDetails?.periodEnd ? new Date(planDetails.periodEnd).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            to="/home"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all"
            style={{ backgroundColor: '#d4af37', color: '#000' }}
          >
            Start Browsing <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/license"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 rounded-lg font-semibold text-white hover:bg-white hover:text-black transition-all"
            style={{ borderColor: '#d4af37' }}
          >
            View License Details
          </Link>
        </div>

        <p className="text-sm text-gray-500">
          Redirecting to home in 3 seconds... or click Start Browsing above
        </p>
      </div>
    </div>
  );
}
