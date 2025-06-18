import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = (await headers()).get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'No webhook secret' }, { status: 500 })
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted({
          metadata: event.data.object.metadata,
          customer: typeof event.data.object.customer === 'string' ? event.data.object.customer : null,
          subscription: typeof event.data.object.subscription === 'string' ? event.data.object.subscription : null
        })
        break
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionUpdate({
          customer: typeof event.data.object.customer === 'string' ? event.data.object.customer : null,
          status: event.data.object.status,
          current_period_end: (event.data.object as { current_period_end?: number }).current_period_end || 0,
          ended_at: (event.data.object as { ended_at?: number | null }).ended_at || null
        })
        break
      case 'invoice.payment_failed':
        await handlePaymentFailed({
          customer: typeof event.data.object.customer === 'string' ? event.data.object.customer : null
        })
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

interface StripeMetadata {
  userId?: string;
  planType?: string;
  billingInterval?: string;
  type?: string;
  creditsAmount?: string;
}

async function handleCheckoutCompleted(sessionData: { 
  metadata: StripeMetadata | null; 
  customer: string | null;
  subscription?: string | null;
}) {
  const metadata = sessionData.metadata;
  if (!metadata?.userId) {
    console.error('No userId in session metadata');
    return;
  }

  const userId = metadata.userId;
  const planType = metadata.planType;
  const billingInterval = metadata.billingInterval;

  if (metadata.type === 'credits') {
    // Handle credit purchase
    const creditsAmount = parseInt(metadata.creditsAmount || '0');
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          increment: creditsAmount
        }
      }
    });

    console.log(`Added ${creditsAmount} credits to user ${userId}`);
  } else {
    // Handle subscription
    const customerId = sessionData.customer;
    if (!customerId) {
      console.error('No customer ID in session');
      return;
    }

    // Create or update subscription
    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        plan: planType || 'starter',
        status: 'active',
        stripeId: sessionData.subscription || '',
        expiresAt: billingInterval === 'yearly' ? 
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) :
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      update: {
        plan: planType || 'starter',
        status: 'active',
        stripeId: sessionData.subscription || '',
        expiresAt: billingInterval === 'yearly' ? 
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) :
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    console.log(`Updated subscription for user ${userId} to ${planType}`);
  }
}

async function handleSubscriptionUpdate(subscriptionData: {
  customer: string | null;
  status: string;
  current_period_end: number;
  ended_at?: number | null;
}) {
  const customerId = subscriptionData.customer;
  if (!customerId) {
    console.error('No customer ID in subscription');
    return;
  }

  // Find user by Stripe customer ID - use subscription relation as workaround
  const subscription = await prisma.subscription.findFirst({
    where: { stripeId: customerId },
    include: { user: true }
  });
  const user = subscription?.user;

  if (!user) {
    console.error(`No user found for customer ${customerId}`);
    return;
  }

  await prisma.subscription.update({
    where: { userId: user.id },
    data: {
      status: subscriptionData.status === 'canceled' ? 'canceled' : 'expired',
      expiresAt: subscriptionData.ended_at ? 
        new Date(subscriptionData.ended_at * 1000) : 
        new Date(subscriptionData.current_period_end * 1000)
    }
  });

  console.log(`Updated subscription status for user ${user.id} to ${subscriptionData.status}`);
}

async function handlePaymentFailed(invoiceData: {
  customer: string | null;
}) {
  const customerId = invoiceData.customer;
  if (!customerId) {
    console.error('No customer ID in invoice');
    return;
  }

  console.log(`Payment failed for customer ${customerId}`);
  // You can add additional logic here like sending notification emails
}
