import { Check, ArrowLeft, Shield, Star, Sparkles, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const STRIPE_PRICE_IDS = {
  basic: 'price_1SWMkEAViJR9tCfxxBexPSmD',
  pro: 'price_1SWMmWAViJR9tCfxgFABERlT',
  elite: 'price_1SWMnBAViJR9tCfxhsunTR4r',
  legendary: 'price_1SWMo7AViJR9tCfxvo2sIcoP',
  personalized: 'price_1SWMosAViJR9tCfxdQEMI5iO',
};

export default function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [hasAttemptedCheckout, setHasAttemptedCheckout] = useState(false);

  useEffect(() => {
    localStorage.removeItem('stripe_checkout_error');

    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'cancelled') {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleCheckout = async (priceId: string, isSubscription: boolean) => {
    setHasAttemptedCheckout(true);
    setErrorMessage('');

    if (priceId.includes('REPLACE_WITH_YOUR')) {
      setErrorMessage('Stripe Price IDs need to be configured. Please update the STRIPE_PRICE_IDS in PricingPage.tsx with your actual Stripe Price IDs from your Stripe Dashboard.');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      setErrorMessage('You must be signed in to subscribe. Redirecting to sign in...');
      setTimeout(() => {
        navigate('/signin');
      }, 1500);
      return;
    }

    setLoading(priceId);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-stripe-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            priceId,
            isSubscription,
            customerEmail: user?.email,
            successUrl: `${window.location.origin}/success`,
            cancelUrl: `${window.location.origin}/pricing?checkout=cancelled`,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to create checkout session`);
      }

      const responseData = await response.json();
      const { url, error } = responseData;

      if (error) {
        throw new Error(error);
      }

      if (!url || typeof url !== 'string' || !url.includes('stripe.com')) {
        console.error('Invalid URL returned:', url);
        throw new Error('Stripe is not configured correctly. Please contact support or check that your Stripe secret key is set up in Supabase Edge Functions.');
      }

      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to start checkout. Please try again.';
      setErrorMessage(errorMsg);
      localStorage.setItem('stripe_checkout_error', errorMsg);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/home"
          className="inline-flex items-center gap-2 text-white hover:text-opacity-80 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Browse
        </Link>

        {hasAttemptedCheckout && errorMessage && (
          <div className="mb-8 p-6 bg-red-900 border-2 border-red-600 rounded-lg flex items-start gap-4 animate-fadeIn">
            <XCircle className="w-6 h-6 text-red-300 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-100 mb-2">Checkout Error</h3>
              <p className="text-red-200 mb-4">{errorMessage}</p>
              <div className="bg-red-950 border border-red-800 rounded p-4 text-sm text-red-200">
                <p className="font-semibold mb-2">Common Solutions:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Check that your Stripe secret key is configured in Supabase Edge Functions</li>
                  <li>Verify that the Stripe Price IDs match your Stripe Dashboard products</li>
                  <li>Make sure the create-stripe-checkout function is deployed</li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage('')}
              className="text-red-300 hover:text-red-100 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        )}

        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4" style={{ color: '#d4af37' }}>
            Choose Your Maximum Plan
          </h1>
          <p className="text-xl text-white">
            Unlock premium stock content for your creative projects
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-gray-900 rounded-lg p-8 border-2 border-gray-700 hover:border-yellow-500 transition-all">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4" style={{ backgroundColor: '#d4af37', color: '#000' }}>
              BASIC
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">$19.99</span>
              <span className="text-lg text-gray-400">/month</span>
            </div>
            <p className="text-sm text-gray-400 mb-6">Perfect for individual creators</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#d4af37' }} />
                <span className="text-white">7 downloads per month</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#d4af37' }} />
                <span className="text-white">Royalty-free license</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#d4af37' }} />
                <span className="text-white">Keyword search</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#d4af37' }} />
                <span className="text-white">Highest quality</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#d4af37' }} />
                <span className="text-white">No watermark</span>
              </li>
            </ul>
            <button
              onClick={() => handleCheckout(STRIPE_PRICE_IDS.basic, true)}
              disabled={loading !== null}
              className="w-full py-3 rounded-lg font-semibold border-2 text-white hover:bg-white hover:text-black transition-all disabled:opacity-50"
              style={{ borderColor: '#d4af37' }}
            >
              {loading === STRIPE_PRICE_IDS.basic ? 'Loading...' : 'Get Started'}
            </button>
          </div>

          <div className="bg-gray-900 rounded-lg p-8 border-2 border-yellow-500 hover:border-yellow-400 transition-all relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full">
              MOST POPULAR
            </div>
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4" style={{ backgroundColor: '#d4af37', color: '#000' }}>
              PRO
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">$39.99</span>
              <span className="text-lg text-gray-400">/month</span>
            </div>
            <p className="text-sm text-gray-400 mb-6">For growing content creators</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#d4af37' }} />
                <span className="text-white">Everything in Basic, PLUS:</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#d4af37' }} />
                <span className="text-white">15 downloads per month</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#d4af37' }} />
                <span className="text-white">AI search</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#d4af37' }} />
                <span className="text-white">Unused credits rollover to next month</span>
              </li>
            </ul>
            <button
              onClick={() => handleCheckout(STRIPE_PRICE_IDS.pro, true)}
              disabled={loading !== null}
              className="w-full py-3 rounded-lg font-semibold border-2 text-white hover:bg-white hover:text-black transition-all disabled:opacity-50"
              style={{ borderColor: '#d4af37' }}
            >
              {loading === STRIPE_PRICE_IDS.pro ? 'Loading...' : 'Get Started'}
            </button>
          </div>

          <div className="bg-gray-900 rounded-lg p-8 border-2 border-gray-700 hover:border-yellow-500 transition-all">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4" style={{ backgroundColor: '#d4af37', color: '#000' }}>
              ELITE
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">$89.99</span>
              <span className="text-lg text-gray-400">/month</span>
            </div>
            <p className="text-sm text-gray-400 mb-6">For professional teams</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#d4af37' }} />
                <span className="text-white">Everything in Pro, PLUS:</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#d4af37' }} />
                <span className="text-white">30 downloads per month</span>
              </li>
            </ul>
            <button
              onClick={() => handleCheckout(STRIPE_PRICE_IDS.elite, true)}
              disabled={loading !== null}
              className="w-full py-3 rounded-lg font-semibold border-2 text-white hover:bg-white hover:text-black transition-all disabled:opacity-50"
              style={{ borderColor: '#d4af37' }}
            >
              {loading === STRIPE_PRICE_IDS.elite ? 'Loading...' : 'Get Started'}
            </button>
          </div>

          <div className="bg-yellow-500 rounded-lg p-8 border-4 shadow-2xl transform lg:scale-105 relative" style={{ borderColor: '#d4af37', boxShadow: '0 0 40px rgba(212, 175, 55, 0.4)' }}>
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-black text-xs font-bold rounded-full" style={{ color: '#d4af37' }}>
              BEST VALUE
            </div>
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4" style={{ backgroundColor: '#000', color: '#d4af37' }}>
              LEGENDARY
            </div>
            <div className="mb-2">
              <span className="text-5xl font-bold text-black">$499.99</span>
              <span className="text-lg text-gray-700">/one-time</span>
            </div>
            <p className="text-sm text-gray-700 italic mb-4">Price increases as library grows</p>
            <p className="text-sm text-gray-700 font-semibold mb-6">Lifetime unlimited access</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#000' }} />
                <span className="text-black">Everything in Elite, PLUS:</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#000' }} />
                <span className="text-black">Unlimited downloads forever</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#000' }} />
                <span className="text-black">Early access to newly released stock</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#000' }} />
                <span className="text-black">Lifetime access (one-time payment)</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#000' }} />
                <span className="text-black">Best value - price locked in</span>
              </li>
            </ul>
            <button
              onClick={() => handleCheckout(STRIPE_PRICE_IDS.legendary, false)}
              disabled={loading !== null}
              className="w-full py-3 rounded-lg font-bold bg-black hover:bg-gray-900 transition-all disabled:opacity-50"
              style={{ color: '#d4af37' }}
            >
              {loading === STRIPE_PRICE_IDS.legendary ? 'Loading...' : 'Get Legendary Access'}
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto mb-16">
          <div className="bg-gray-900 rounded-lg p-8 border-2 border-gray-700 hover:border-yellow-500 transition-all">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4" style={{ backgroundColor: '#d4af37', color: '#000' }}>
              ADD-ON
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">Personalized Stock</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold" style={{ color: '#d4af37' }}>$9.99</span>
              <span className="text-gray-400"> one-time payment</span>
            </div>
            <p className="text-gray-400 mb-6">Get custom videos made for your specific needs</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#d4af37' }} />
                <span className="text-white">3 versions of your described video</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#d4af37' }} />
                <span className="text-white">Royalty-free license</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#d4af37' }} />
                <span className="text-white">Highest quality</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#d4af37' }} />
                <span className="text-white">No watermark</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#d4af37' }} />
                <span className="text-white">Delivered within 48 hours</span>
              </li>
            </ul>
            <button
              onClick={() => handleCheckout(STRIPE_PRICE_IDS.personalized, false)}
              disabled={loading !== null}
              className="w-full py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              style={{ backgroundColor: '#d4af37', color: '#000' }}
            >
              {loading === STRIPE_PRICE_IDS.personalized ? 'Loading...' : 'Order Custom Video'}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#d4af37' }}>
              <Shield className="w-8 h-8 text-black" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Royalty-Free</h3>
            <p className="text-gray-400 text-sm">Use in any project, commercial or personal</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#d4af37' }}>
              <Star className="w-8 h-8 text-black" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Highest Quality</h3>
            <p className="text-gray-400 text-sm">4K videos and high-res photos</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#d4af37' }}>
              <Check className="w-8 h-8 text-black" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No Watermarks</h3>
            <p className="text-gray-400 text-sm">Clean, professional content</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#d4af37' }}>
              <Sparkles className="w-8 h-8 text-black" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">AI Search</h3>
            <p className="text-gray-400 text-sm">Find exactly what you need instantly</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: '#d4af37' }}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-400">Yes, cancel subscriptions anytime. No commitments.</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-2">Do unused downloads expire?</h3>
              <p className="text-gray-400">Pro tier and above: unused credits roll over. Basic: resets monthly.</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-2">What's included in Legendary?</h3>
              <p className="text-gray-400">Unlimited downloads forever. One-time payment, lifetime access.</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-2">How does Personalized Stock work?</h3>
              <p className="text-gray-400">Describe your video needs, we create 3 custom versions for you.</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-2">Will Legendary price increase?</h3>
              <p className="text-gray-400">Yes, as we add more videos. Lock in current price by purchasing now.</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-2">What payment methods accepted?</h3>
              <p className="text-gray-400">All major credit cards via secure Stripe checkout.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
