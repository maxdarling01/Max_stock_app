import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { StripeProduct } from '../../stripe-config';
import { createCheckoutSession } from '../../services/stripe';
import { useAuth } from '../../hooks/useAuth';

interface PricingCardProps {
  product: StripeProduct;
  featured?: boolean;
}

export function PricingCard({ product, featured = false }: PricingCardProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    if (!user) {
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

      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className={`relative rounded-2xl border ${
      featured 
        ? 'border-blue-500 shadow-xl scale-105' 
        : 'border-gray-200 shadow-lg'
    } bg-white p-8`}>
      {featured && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}
      
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {product.name}
        </h3>
        
        <div className="mb-4">
          <span className="text-4xl font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.mode === 'subscription' && (
            <span className="text-gray-500 ml-1">/month</span>
          )}
        </div>
        
        <p className="text-gray-600 mb-6">
          {product.description}
        </p>
        
        <Button
          onClick={handlePurchase}
          loading={loading}
          variant={featured ? 'primary' : 'outline'}
          className="w-full"
        >
          {product.mode === 'subscription' ? 'Subscribe' : 'Purchase'}
        </Button>
      </div>
    </div>
  );
}