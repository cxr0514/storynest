import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe, STRIPE_PRICES, CREDITS_CONFIG } from '@/lib/stripe'
import { getPlanLimits } from '@/lib/plan-limits'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user with subscription info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        credits: true,
        Subscription: {
          select: {
            plan: true,
            status: true,
            expiresAt: true,
            stripeId: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get current plan - default to free if no subscription
    const currentPlan = user.Subscription?.plan || 'free'
    const planLimits = getPlanLimits(currentPlan)
    
    // Calculate stories this month (simplified for demo)
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const storiesThisMonth = await prisma.story.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startOfMonth
        }
      }
    })

    // Count total characters created by user
    const charactersCount = await prisma.character.count({
      where: {
        userId: session.user.id
      }
    })

    const usage = {
      storiesThisMonth,
      storiesLimit: planLimits.storiesPerMonth,
      credits: user.credits || 0,
      imagesPerStory: planLimits.imagesPerStory,
      childProfilesLimit: planLimits.childProfiles,
      charactersCount,
      charactersLimit: planLimits.charactersLimit
    }

    return NextResponse.json({
      plan: currentPlan,
      usage,
      planExpiresAt: user.Subscription?.expiresAt,
      stripeSubscriptionId: user.Subscription?.stripeId,
      features: planLimits.features
    })

  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, planType, billingInterval } = await req.json()

    switch (action) {
      case 'create-checkout-session':
        return await createCheckoutSession(session.user.id, planType, billingInterval)

      case 'manage-subscription':
        return await createCustomerPortalSession(session.user.id)

      case 'purchase-credits':
        return await purchaseCredits(session.user.id)

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error handling subscription action:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}

async function createCheckoutSession(userId: string, planType: string, billingInterval: 'monthly' | 'yearly') {
  try {
    // Get or create customer
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, Subscription: true }
    })

    if (!user?.email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 })
    }

    let customerId = user.Subscription?.stripeId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId }
      })
      customerId = customer.id
    }

    // Get price ID based on plan and billing interval
    let priceId: string
    
    if (planType === 'lifetime') {
      priceId = STRIPE_PRICES.lifetime
    } else if (planType === 'starter') {
      priceId = billingInterval === 'yearly' ? STRIPE_PRICES.starter.yearly : STRIPE_PRICES.starter.monthly
    } else if (planType === 'premium') {
      priceId = billingInterval === 'yearly' ? STRIPE_PRICES.premium.yearly : STRIPE_PRICES.premium.monthly
    } else {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: planType === 'lifetime' ? 'payment' : 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        userId,
        planType,
        billingInterval
      }
    })

    return NextResponse.json({ 
      checkoutUrl: session.url,
      sessionId: session.id 
    })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}

async function createCustomerPortalSession(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { Subscription: true }
    })

    if (!user?.Subscription?.stripeId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 })
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.Subscription.stripeId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    })

    return NextResponse.json({ 
      portalUrl: portalSession.url 
    })

  } catch (error) {
    console.error('Error creating customer portal session:', error)
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 })
  }
}

async function purchaseCredits(userId: string) {
  try {
    // Get or create customer
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, Subscription: true }
    })

    if (!user?.email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 })
    }

    let customerId = user.Subscription?.stripeId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId }
      })
      customerId = customer.id
    }

    // Create checkout session for credits
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: STRIPE_PRICES.credits,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?credits_purchased=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        userId,
        type: 'credits',
        creditsAmount: CREDITS_CONFIG.credits.toString()
      }
    })

    return NextResponse.json({ 
      checkoutUrl: session.url,
      sessionId: session.id 
    })

  } catch (error) {
    console.error('Error purchasing credits:', error)
    return NextResponse.json({ error: 'Failed to purchase credits' }, { status: 500 })
  }
}
