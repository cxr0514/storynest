import { loadStripe, Stripe } from '@stripe/stripe-js'

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
let stripePromise: Promise<Stripe | null>
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

export interface CheckoutSessionData {
  planType: 'starter' | 'premium' | 'lifetime'
  billingInterval?: 'monthly' | 'yearly'
}

export interface SubscriptionData {
  plan: string
  usage: {
    storiesThisMonth: number
    storiesLimit: number
    credits: number
    imagesPerStory: number
    childProfilesLimit: number
    charactersCount: number
    charactersLimit: number
  }
  planExpiresAt?: string
  stripeSubscriptionId?: string
  features: string[]
}

// Create checkout session for subscription
export async function createCheckoutSession(data: CheckoutSessionData) {
  try {
    const response = await fetch('/api/subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'create-checkout-session',
        planType: data.planType,
        billingInterval: data.billingInterval || 'monthly'
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to create checkout session')
    }

    if (result.checkoutUrl) {
      window.location.href = result.checkoutUrl
    }

    return result
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

// Create customer portal session
export async function createCustomerPortal() {
  try {
    const response = await fetch('/api/subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'manage-subscription'
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to create portal session')
    }

    if (result.portalUrl) {
      window.location.href = result.portalUrl
    }

    return result
  } catch (error) {
    console.error('Error creating customer portal:', error)
    throw error
  }
}

// Purchase credits
export async function purchaseCredits() {
  try {
    const response = await fetch('/api/subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'purchase-credits'
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to purchase credits')
    }

    if (result.checkoutUrl) {
      window.location.href = result.checkoutUrl
    }

    return result
  } catch (error) {
    console.error('Error purchasing credits:', error)
    throw error
  }
}

// Fetch subscription data
export async function fetchSubscriptionData(): Promise<SubscriptionData> {
  try {
    const response = await fetch('/api/subscription', {
      method: 'GET',
    })

    const result = await response.json()

    if (!response.ok) {
      // Don't log 401 errors as they're expected when not authenticated
      if (response.status === 401) {
        throw new Error('Not authenticated')
      }
      throw new Error(result.error || 'Failed to fetch subscription data')
    }

    return result
  } catch (error) {
    // Only log non-authentication errors
    if (error instanceof Error && error.message !== 'Not authenticated') {
      console.error('Error fetching subscription data:', error)
    }
    throw error
  }
}

export default getStripe
