import { CheckCircle, ArrowRight, AlertCircle, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function SuccessPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [checking, setChecking] = useState(true);
  const [subscriptionActivated, setSubscriptionActivated] = useState(false);
  const [planDetails, setPlanDetails] = useState<{
    planType: string;
    downloadsRemaining: number;
    periodEnd: string;
  } | null>(null);
  const [pollAttempts, setPollAttempts] = useState(0);
  const maxPollAttempts = 30;

  useEffect(() => {
    if (!user) {
      return;
    }

    let pollInterval: number;

    const checkSubscriptionStatus = async () => {
      try {
        const { data: subscription, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking subscription:', error);
          return;
        }

        if (subscription && subscription.subscription_status === 'active') {
          setSubscriptionActivated(true);
          setPlanDetails({
            planType: subscription.plan_type,
            downloadsRemaining: subscription.downloads_remaining,
            periodEnd: subscription.current_period_end,
          });
          setChecking(false);

          if (pollInterval) {
            clearInterval(pollInterval);
          }

          setTimeout(() => {
            navigate('/home');
          }, 3000);
        } else {
          setPollAttempts(prev => prev + 1);

          if (pollAttempts >= maxPollAttempts) {
            setChecking(false);
            if (pollInterval) {
              clearInterval(pollInterval);
            }
          }
        }
      } catch (err) {
        console.error('Error polling subscription:', err);
      }
    };

    checkSubscriptionStatus();

    pollInterval = window.setInterval(checkSubscriptionStatus, 2000);

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [user, navigate, pollAttempts]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center">
          <AlertCircle className="w-20 h-20 mx-auto mb-6" style={{ color: '#d4af37' }} />
          <h1 className="text-3xl font-bold text-white mb-4">Please Sign In</h1>
          <p className="text-gray-300 mb-8">You need to be signed in to view this page.</p>
          <Link
            to="/signin"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all"
            style={{ backgroundColor: '#d4af37', color: '#000' }}
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (checking && pollAttempts < maxPollAttempts) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center animate-pulse" style={{ backgroundColor: '#d4af37' }}>
              <Clock className="w-10 h-10 text-black" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Processing Your Payment
          </h1>
          <p className="text-lg text-gray-300 mb-2">
            Please wait while we activate your subscription...
          </p>
          <p className="text-sm text-gray-400">
            This usually takes just a few seconds
          </p>
          <div className="mt-8 flex justify-center">
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#d4af37', animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#d4af37', animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#d4af37', animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!subscriptionActivated && pollAttempts >= maxPollAttempts) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-8">
            <Clock className="w-20 h-20 mx-auto" style={{ color: '#d4af37' }} />
          </div>

          <h1 className="text-4xl font-bold mb-4" style={{ color: '#d4af37' }}>
            Payment Processing
          </h1>

          <p className="text-lg text-gray-300 mb-4">
            Your payment was received and is being processed.
          </p>

          <p className="text-gray-400 mb-8">
            Your subscription will be activated within the next few minutes. You can start browsing now and your downloads will be available shortly.
          </p>

          <div className="mb-8 p-6 bg-gray-900 rounded-lg border-2" style={{ borderColor: '#d4af37' }}>
            <h3 className="text-lg font-semibold text-white mb-3">What happens next?</h3>
            <div className="text-left space-y-3 text-gray-300">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#d4af37' }} />
                <span>Your subscription will be activated automatically</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#d4af37' }} />
                <span>You'll receive an email confirmation from Stripe</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#d4af37' }} />
                <span>Downloads will be available in your account</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/home"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all"
              style={{ backgroundColor: '#d4af37', color: '#000' }}
            >
              Start Browsing <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 rounded-lg font-semibold text-white hover:bg-white hover:text-black transition-all"
              style={{ borderColor: '#d4af37' }}
            >
              View Plans
            </Link>
          </div>
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
          Redirecting to home in 3 seconds...
        </p>
      </div>
    </div>
  );
}
