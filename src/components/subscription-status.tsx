'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSubscription } from '@/hooks/useSubscription'
import { useRouter } from 'next/navigation'

export function SubscriptionStatus() {
  const { subscription, loading, error, openCustomerPortal, hasActiveSubscription } = useSubscription()
  const router = useRouter()

  if (loading) {
    return (
      <Card className="p-6">
        <CardContent className="p-0">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6 border-red-200">
        <CardContent className="p-0">
          <p className="text-red-600 text-sm">Error loading subscription: {error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!subscription) return null

  const { plan, usage } = subscription

  return (
    <Card className="p-6">
      <CardContent className="p-0">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 capitalize mb-1">
              {plan === 'free' ? 'Free Plan' : `${plan} Plan`}
            </h3>
            {subscription.planExpiresAt && (
              <p className="text-sm text-gray-600">
                {plan === 'lifetime' ? 'Lifetime access' : 
                 `Renews ${new Date(subscription.planExpiresAt).toLocaleDateString()}`}
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            {hasActiveSubscription && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={openCustomerPortal}
              >
                Manage
              </Button>
            )}
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => router.push('/pricing')}
            >
              {hasActiveSubscription ? 'Upgrade' : 'Subscribe'}
            </Button>
          </div>
        </div>

        {/* Usage Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Stories This Month</div>
            <div className="text-xl font-semibold text-gray-800">
              {usage.storiesThisMonth}
              <span className="text-sm text-gray-500">
                /{usage.storiesLimit === -1 ? '∞' : usage.storiesLimit}
              </span>
            </div>
            {usage.storiesLimit !== -1 && (
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min((usage.storiesThisMonth / usage.storiesLimit) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Story Credits</div>
            <div className="text-xl font-semibold text-gray-800">
              {usage.credits}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Available credits
            </div>
          </div>
        </div>

        {/* Plan Features */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Images per story:</span>
              <span className="ml-2 font-medium">{usage.imagesPerStory}</span>
            </div>
            <div>
              <span className="text-gray-600">Child profiles:</span>
              <span className="ml-2 font-medium">
                {usage.childProfilesLimit === -1 ? 'Unlimited' : usage.childProfilesLimit}
              </span>
            </div>
          </div>
        </div>

        {/* Low usage warning */}
        {plan === 'free' && usage.storiesThisMonth >= 2 && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              You&apos;ve used {usage.storiesThisMonth} of your {usage.storiesLimit} free stories this month. 
              <button 
                className="ml-1 underline font-medium"
                onClick={() => router.push('/pricing')}
              >
                Upgrade to continue creating stories.
              </button>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
