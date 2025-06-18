import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil',
  typescript: true,
})

// Stripe Price Configuration
export const STRIPE_PRICES = {
  starter: {
    monthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID!,
    yearly: process.env.STRIPE_STARTER_YEARLY_PRICE_ID!,
  },
  premium: {
    monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID!,
    yearly: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID!,
  },
  lifetime: process.env.STRIPE_LIFETIME_PRICE_ID!,
  credits: process.env.STRIPE_CREDITS_PRICE_ID!,
}

// Plan configurations matching PRD
export const PLAN_CONFIGS = {
  starter: {
    name: 'Starter Plan',
    description: 'Perfect for growing families',
    monthly: { price: 4.99, priceId: STRIPE_PRICES.starter.monthly },
    yearly: { price: 49.99, priceId: STRIPE_PRICES.starter.yearly },
    features: {
      storiesPerMonth: 30,
      imagesPerStory: 3,
      childProfiles: 3,
      features: ['character-creation', 'character-consistency', 'hd-images', 'priority-queue']
    }
  },
  premium: {
    name: 'Premium Plan',
    description: 'For families who love unlimited storytelling',
    monthly: { price: 9.99, priceId: STRIPE_PRICES.premium.monthly },
    yearly: { price: 89.99, priceId: STRIPE_PRICES.premium.yearly },
    features: {
      storiesPerMonth: 100,
      imagesPerStory: 5,
      childProfiles: -1, // unlimited
      features: ['advanced-customization', 'audio-narration', 'offline-reading', 'early-access']
    }
  },
  lifetime: {
    name: 'Family Lifetime',
    description: 'Complete access for your family forever',
    oneTime: { price: 149.00, priceId: STRIPE_PRICES.lifetime },
    features: {
      storiesPerMonth: 100,
      imagesPerStory: 5,
      childProfiles: -1, // unlimited
      features: ['all-premium-features', 'annual-printed-book']
    }
  }
}

export const CREDITS_CONFIG = {
  name: 'Story Credits',
  description: '25 additional stories',
  price: 9.99,
  priceId: STRIPE_PRICES.credits,
  credits: 25
}
