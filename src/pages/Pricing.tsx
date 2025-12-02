import React from 'react';
import { PricingCard } from '../components/pricing/PricingCard';
import { stripeProducts, getSubscriptionProducts, getOneTimeProducts } from '../stripe-config';

export function Pricing() {
  const subscriptionProducts = getSubscriptionProducts();
  const oneTimeProducts = getOneTimeProducts();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Get access to premium stock videos and photos
          </p>
        </div>

        {/* Subscription Plans */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Subscription Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {subscriptionProducts.map((product, index) => (
              <PricingCard
                key={product.id}
                product={product}
                popular={index === 1} // Make Pro Plan popular
              />
            ))}
          </div>
        </div>

        {/* One-time Purchases */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            One-time Purchases
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {oneTimeProducts.map((product) => (
              <PricingCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}