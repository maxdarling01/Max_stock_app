import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { stripeProducts, getSubscriptionProducts, getOneTimeProducts } from '../stripe-config';
import { createCheckoutSession, getUserSubscription } from '../lib/stripe';
import { Check, Crown, Zap, Star, Sparkles, AlertCircle } from 'lucide-react';

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [currentSubscription, setCurrentSubscription] = useState<string | null>(null);

  const subscriptionProducts = getSubscriptionProducts();
  const oneTimeProducts = getOneTimeProducts();

  useEffect(() => {
    if (user) {
      loadUserSubscription();
    }
  }, [user]);

  const loadUserSubscription = async () => {
    try {
      const subscription = await getUserSubscription();
      if (subscription?.price_id && subscription.subscription_status === 'active') {
        setCurrentSubscription(subscription.price_id);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const handlePurchase = async (priceId: string, mode: 'payment' | 'subscription') => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(priceId);
    setError('');

    try {
      const { url } = await createCheckoutSession({
        price_id: priceId,
        success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: window.location.href,
        mode,
      });

      window.location.href = url;
    } catch (error: any) {
      setError(error.message);
      setLoading(null);
    }
  };

  const getProductIcon = (name: string) => {
    switch (name) {
      case 'Basic Plan':
        return <Star className="w-6 h-6 text-blue-600" />;
      case 'Pro Plan':
        return <Zap className="w-6 h-6 text-purple-600" />;
      case 'Elite Plan':
        return <Crown className="w-6 h-6 text-amber-600" />;
      case 'Legendary Plan':
        return <Sparkles className="w-6 h-6 text-gradient" />;
      default:
        return <Star className="w-6 h-6 text-gray-600" />;
    }
  };

  const isCurrentPlan = (priceId: string) => currentSubscription === priceId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock premium stock videos and photos with our flexible pricing options
          </p>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Subscription Plans */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Monthly Subscription Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subscriptionProducts.map((product) => (
              <Card 
                key={product.id} 
                className={`relative transition-all duration-200 hover:shadow-lg ${
                  product.name === 'Pro Plan' ? 'ring-2 ring-purple-500 scale-105' : ''
                } ${isCurrentPlan(product.priceId) ? 'ring-2 ring-green-500' : ''}`}
              >
                {product.name === 'Pro Plan' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                {isCurrentPlan(product.priceId) && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Current Plan
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    {getProductIcon(product.name)}
                  </div>
                  <CardTitle className="text-xl font-bold">{product.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">${product.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-center mb-6 min-h-[3rem] flex items-center justify-center">
                    {product.description}
                  </CardDescription>
                  <Button
                    onClick={() => handlePurchase(product.priceId, product.mode)}
                    disabled={loading === product.priceId || isCurrentPlan(product.priceId)}
                    className={`w-full ${
                      product.name === 'Pro Plan' 
                        ? 'bg-purple-600 hover:bg-purple-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    } ${isCurrentPlan(product.priceId) ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  >
                    {loading === product.priceId ? (
                      'Processing...'
                    ) : isCurrentPlan(product.priceId) ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Current Plan
                      </>
                    ) : (
                      'Subscribe Now'
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* One-time Purchases */}
        <div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            One-Time Purchases
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {oneTimeProducts.map((product) => (
              <Card key={product.id} className="transition-all duration-200 hover:shadow-lg">
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    {getProductIcon(product.name)}
                  </div>
                  <CardTitle className="text-xl font-bold">{product.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">${product.price}</span>
                    <span className="text-gray-600"> one-time</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-center mb-6 min-h-[3rem] flex items-center justify-center">
                    {product.description}
                  </CardDescription>
                  <Button
                    onClick={() => handlePurchase(product.priceId, product.mode)}
                    disabled={loading === product.priceId}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                  >
                    {loading === product.priceId ? 'Processing...' : 'Purchase Now'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {!user && (
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Need an account? Sign up to get started with our premium content.
            </p>
            <Button
              onClick={() => navigate('/signup')}
              variant="outline"
              className="mx-2"
            >
              Sign Up
            </Button>
            <Button
              onClick={() => navigate('/login')}
              className="mx-2 bg-blue-600 hover:bg-blue-700"
            >
              Sign In
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}