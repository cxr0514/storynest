'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createCheckoutSession, purchaseCredits } from '@/lib/stripe-client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function Pricing() {
  const [loading, setLoading] = useState<string | null>(null)
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly')
  const { data: session } = useSession()
  const router = useRouter()

  const handleSubscription = async (planType: 'starter' | 'premium' | 'lifetime') => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    setLoading(planType)
    try {
      await createCheckoutSession({
        planType,
        billingInterval: planType === 'lifetime' ? undefined : billingInterval
      })
    } catch (error) {
      console.error('Subscription error:', error)
      // You might want to show a toast notification here
    } finally {
      setLoading(null)
    }
  }

  const handleCredits = async () => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    setLoading('credits')
    try {
      await purchaseCredits()
    } catch (error) {
      console.error('Credits purchase error:', error)
      // You might want to show a toast notification here
    } finally {
      setLoading(null)
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent mb-6">
            Choose Your Adventure Plan 🚀
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Start creating magical stories for free, or unlock unlimited adventures with our premium plans.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1 border border-orange-200">
            <Button 
              variant={billingInterval === 'monthly' ? 'primary' : 'ghost'} 
              size="sm" 
              className="rounded-lg"
              onClick={() => setBillingInterval('monthly')}
            >
              Monthly
            </Button>
            <Button 
              variant={billingInterval === 'yearly' ? 'primary' : 'ghost'} 
              size="sm" 
              className="rounded-lg"
              onClick={() => setBillingInterval('yearly')}
            >
              Yearly (Save 17%)
            </Button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
          {/* Free Plan */}
          <Card className="relative p-8 border-2 border-gray-200">
            <CardContent className="text-center p-0">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Starter</h3>
              <div className="text-4xl font-bold text-gray-900 mb-1">Free</div>
              <div className="text-gray-600 mb-6">Perfect for trying out StoryNest</div>
              
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  3 stories per month
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  1 child profile
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  3 custom characters
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Digital stories only
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Basic illustrations
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Reading progress sync
                </li>
              </ul>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => session ? router.push('/dashboard') : router.push('/auth/signin')}
              >
                Get Started Free
              </Button>
              
              <p className="text-xs text-gray-500 mt-4">No credit card required</p>
            </CardContent>
          </Card>
          
          {/* Premium Plan */}
          <Card className="relative p-8 border-2 border-orange-500 bg-gradient-to-br from-orange-50 to-rose-50 transform scale-105">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
              Most Popular
            </div>
            <CardContent className="text-center p-0">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Starter</h3>
              <div className="text-4xl font-bold text-gray-900 mb-1">
                ${billingInterval === 'yearly' ? '4.16' : '4.99'}
              </div>
              <div className="text-gray-600 mb-2">per month</div>
              <div className="text-sm text-gray-500 mb-6">
                {billingInterval === 'yearly' ? 'or $49.99/year (save 17%)' : 'or $49.99/year (save 17%)'}
              </div>
              
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  30 stories per month
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  3 images per story
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Up to 3 child profiles
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Character creation & consistency
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  HD images
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Priority story generation
                </li>
              </ul>
              
              <Button 
                className="w-full mb-4"
                onClick={() => handleSubscription('starter')}
                disabled={loading === 'starter'}
              >
                {loading === 'starter' ? 'Processing...' : 'Start 7-Day Free Trial'}
              </Button>
              
              <p className="text-xs text-gray-500">Cancel anytime • No commitment</p>
            </CardContent>
          </Card>
          
          {/* Print Plan */}
          <Card className="relative p-8 border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
              Premium
            </div>
            <CardContent className="text-center p-0">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Premium</h3>
              <div className="text-4xl font-bold text-gray-900 mb-1">
                ${billingInterval === 'yearly' ? '7.49' : '9.99'}
              </div>
              <div className="text-gray-600 mb-2">per month</div>
              <div className="text-sm text-gray-500 mb-6">
                {billingInterval === 'yearly' ? 'or $89.99/year (save 25%)' : 'or $89.99/year (save 25%)'}
              </div>
              
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  100 stories per month
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  5 images per story
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Unlimited child profiles
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Advanced character customization
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Audio narration (coming soon)
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Offline reading mode
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Early-access features
                </li>
              </ul>
              
              <Button 
                variant="secondary" 
                className="w-full mb-4"
                onClick={() => handleSubscription('premium')}
                disabled={loading === 'premium'}
              >
                {loading === 'premium' ? 'Processing...' : 'Upgrade to Premium'}
              </Button>
              
              <p className="text-xs text-gray-500">Perfect for gifts & keepsakes</p>
            </CardContent>
          </Card>
        </div>

        {/* Lifetime Plan */}
        <div className="max-w-2xl mx-auto mb-12">
          <Card className="relative p-8 border-2 border-gradient-to-r from-purple-500 to-pink-500 bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
              Best Value
            </div>
            <CardContent className="text-center p-0">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Family Lifetime</h3>
              <div className="text-4xl font-bold text-gray-900 mb-1">$149</div>
              <div className="text-gray-600 mb-6">one-time payment</div>
              
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  100 stories per month for life
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  All Premium features included
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Unlimited child profiles
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  1 free printed book per year
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Lifetime updates
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  No recurring payments ever
                </li>
              </ul>
              
              <Button 
                className="w-full mb-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                onClick={() => handleSubscription('lifetime')}
                disabled={loading === 'lifetime'}
              >
                {loading === 'lifetime' ? 'Processing...' : 'Get Lifetime Access'}
              </Button>
              
              <p className="text-xs text-gray-500">Perfect for families who love storytelling</p>
            </CardContent>
          </Card>
        </div>

        {/* Pay-as-you-go Credits */}
        <div className="max-w-2xl mx-auto mb-12">
          <Card className="p-6">
            <CardContent className="text-center p-0">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Story Credits</h3>
              <p className="text-gray-600 mb-4">Perfect for occasional storytellers</p>
              
              <div className="mb-4">
                <span className="text-2xl font-bold text-orange-600">$9.99</span>
                <span className="text-gray-600 ml-2">for 25 additional stories</span>
              </div>
              
              <ul className="text-sm text-gray-600 mb-6 space-y-1">
                <li>• Credits stack with any existing plan</li>
                <li>• Perfect for gift giving</li>
                <li>• Credits roll over for up to 90 days</li>
                <li>• No subscription required</li>
              </ul>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleCredits}
                disabled={loading === 'credits'}
              >
                {loading === 'credits' ? 'Processing...' : 'Purchase Story Credits'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Frequently Asked Questions
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <CardContent className="p-0">
                <h4 className="font-semibold text-lg mb-3">Can I cancel anytime?</h4>
                <p className="text-gray-600">Absolutely! You can cancel your subscription at any time with no cancellation fees. Your benefits continue until the end of your billing period.</p>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <h4 className="font-semibold text-lg mb-3">How does the free trial work?</h4>
                <p className="text-gray-600">Start with a 7-day free trial of our Family plan. No credit card required for the free plan. You can upgrade or downgrade at any time.</p>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <h4 className="font-semibold text-lg mb-3">What about shipping costs?</h4>
                <p className="text-gray-600">Premium Print plan includes free shipping worldwide. Additional books can be ordered at discounted rates with low shipping costs.</p>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <h4 className="font-semibold text-lg mb-3">Can I change plans later?</h4>
                <p className="text-gray-600">Yes! You can upgrade, downgrade, or change plans at any time. Changes take effect at your next billing cycle.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20 p-12 bg-white rounded-3xl shadow-lg">
          <h3 className="text-3xl font-bold text-gray-800 mb-4">
            Ready to Create Magic? ✨
          </h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of families already creating personalized bedtime stories that bring joy, learning, and imagination to children worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="px-8"
              onClick={() => session ? router.push('/dashboard') : router.push('/auth/signin')}
            >
              Start Free Trial
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8"
              onClick={() => router.push('/stories')}
            >
              View Sample Stories
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
