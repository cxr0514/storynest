'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { SubscriptionData, fetchSubscriptionData, createCustomerPortal } from '@/lib/stripe-client'

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()

  const fetchData = useCallback(async () => {
    if (!session) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await fetchSubscriptionData()
      setSubscription(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription')
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const openCustomerPortal = async () => {
    try {
      await createCustomerPortal()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open customer portal')
    }
  }

  const refreshSubscription = () => {
    fetchData()
  }

  return {
    subscription,
    loading,
    error,
    openCustomerPortal,
    refreshSubscription,
    hasActiveSubscription: subscription?.plan !== 'free'
  }
}
