export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  mode: 'payment' | 'subscription';
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_TTJMneIVyc2z2H',
    priceId: 'price_1SWMkEAViJR9tCfxxBexPSmD',
    name: 'Basic Plan',
    description: '7 downloads per month with keyword search',
    price: 19.99,
    currency: 'usd',
    mode: 'subscription'
  },
  {
    id: 'prod_TTJPjD6Iar6t6i',
    priceId: 'price_1SWMmWAViJR9tCfxgFABERlT',
    name: 'Pro Plan',
    description: '15 downloads per month with AI search and rollover credits',
    price: 39.99,
    currency: 'usd',
    mode: 'subscription'
  },
  {
    id: 'prod_TTJQXaidnkebBk',
    priceId: 'price_1SWMnBAViJR9tCfxhsunTR4r',
    name: 'Elite Plan',
    description: '30 downloads per month',
    price: 89.99,
    currency: 'usd',
    mode: 'subscription'
  },
  {
    id: 'prod_TTJRzeK87f0B60',
    priceId: 'price_1SWMosAViJR9tCfxdQEMI5iO',
    name: 'Personalized Stock',
    description: '1 idea, 3 custom video versions',
    price: 9.99,
    currency: 'usd',
    mode: 'payment'
  },
  {
    id: 'prod_TTJQQsLB3k8VAW',
    priceId: 'price_1SWMo7AViJR9tCfxvo2sIcoP',
    name: 'Legendary Plan',
    description: 'Unlimited downloads with early access',
    price: 499.99,
    currency: 'usd',
    mode: 'payment'
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};

export const getSubscriptionProducts = (): StripeProduct[] => {
  return stripeProducts.filter(product => product.mode === 'subscription');
};

export const getOneTimeProducts = (): StripeProduct[] => {
  return stripeProducts.filter(product => product.mode === 'payment');
};