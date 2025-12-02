import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { StripeProduct } from '../../stripe-config';
import { createCheckoutSession } from '../../services/stripe';
import { useAuth } from '../../hooks/useAuth';

interface PricingCardProps {
  product: StripeProduct;
  popular?: boolean;
}

export function PricingCard({ product, popular = false }: PricingCardProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }

    setLoading(true);
    try {
      const { url } = await createCheckoutSession({
        price_id: product.priceId,
        success_url: `${window.location.origin}/success`,
        cancel_url: `${window.location.origin}/pricing`,
        mode: product.mode,
      });

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = getFeaturesByPlan(product.name);

  return (
    <div className={`relative rounded-2xl border ${popular ? 'border-blue-500 shadow-lg' : 'border-gray-200'} bg-white p-8`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}
      
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900">{product.name}</h3>
        <p className="mt-2 text-gray-600">{product.description}</p>
        
        <div className="mt-6">
          <span className="text-4xl font-bold text-gray-900">${product.price}</span>
          {product.mode === 'subscription' && (
            <span className="text-gray-600">/month</span>
          )}
        </div>
      </div>

      <ul className="mt-8 space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={handleSubscribe}
        loading={loading}
        className="w-full mt-8"
        variant={popular ? 'primary' : 'outline'}
      >
        {product.mode === 'subscription' ? 'Subscribe' : 'Purchase'}
      </Button>
    </div>
  );
}

function getFeaturesByPlan(planName: string): string[] {
  const features: Record<string, string[]> = {
    'Basic Plan': [
      '7 downloads per month',
      'Keyword search',
      'HD & 4K quality',
      'Standard support'
    ],
    'Pro Plan': [
      '15 downloads per month',
      'AI-powered search',
      'Rollover credits',
      'HD & 4K quality',
      'Priority support'
    ],
    'Elite Plan': [
      '30 downloads per month',
      'AI-powered search',
      'Rollover credits',
      'HD & 4K quality',
      'Priority support',
      'Early access to new content'
    ],
    'Legendary Plan': [
      'Unlimited downloads',
      'AI-powered search',
      'HD & 4K quality',
      'Priority support',
      'Early access to new content',
      'Commercial license'
    ],
    'Personalized Stock': [
      '1 custom idea',
      '3 video versions',
      'HD & 4K quality',
      'Commercial license',
      'Dedicated support'
    ]
  };

  return features[planName] || [];
}