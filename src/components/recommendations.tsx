'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'

interface StoryRecommendation {
  id: string
  title: string
  summary: string
  recommendationReason: string
  matchScore: number
  recommendedCharacters?: string[]
  themes: string[]
  ageGroups: string[]
  estimatedReadTime: number
}

interface RecommendationsProps {
  childProfileId?: string
  quick?: boolean
  className?: string
}

export function Recommendations({ childProfileId, quick = false, className = '' }: RecommendationsProps) {
  const { data: session } = useSession()
  const [recommendations, setRecommendations] = useState<StoryRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadRecommendations = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        childProfileId: childProfileId!,
        quick: quick.toString()
      })
      
      const response = await fetch(`/api/recommendations?${params}`)
      if (response.ok) {
        const data = await response.json()
        setRecommendations(data.recommendations)
      } else {
        setError('Failed to load recommendations')
      }
    } catch (error) {
      console.error('Error loading recommendations:', error)
      setError('Error loading recommendations')
    } finally {
      setIsLoading(false)
    }
  }, [childProfileId, quick])

  useEffect(() => {
    if (session && childProfileId) {
      loadRecommendations()
    }
  }, [session, childProfileId, loadRecommendations])

  const handleRecommendationClick = async (recommendation: StoryRecommendation) => {
    // Track the click
    await trackInteraction(recommendation.id, 'clicked')
    
    // Navigate to story creation with recommendation context
    const params = new URLSearchParams({
      childProfileId: childProfileId!,
      recommendedTitle: recommendation.title,
      recommendedTheme: recommendation.themes[0] || '',
      recommendedCharacters: (recommendation.recommendedCharacters || []).join(',')
    })
    
    window.location.href = `/stories/create?${params}`
  }

  const handleDismiss = async (recommendationId: string) => {
    await trackInteraction(recommendationId, 'dismissed')
    setRecommendations(prev => prev.filter(r => r.id !== recommendationId))
  }

  const trackInteraction = async (recommendationId: string, action: string) => {
    try {
      await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recommendationId,
          action,
          childProfileId,
          context: { timestamp: new Date().toISOString() }
        })
      })
    } catch (error) {
      console.error('Error tracking interaction:', error)
    }
  }

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(quick ? 3 : 6)].map((_, i) => (
          <Card key={i} className="animate-shimmer" animation="scale" delay={i * 100}>
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <p className="text-red-600">{error}</p>
          <Button variant="outline" onClick={loadRecommendations} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (recommendations.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Recommendations Yet</h3>
          <p className="text-gray-600 mb-4">
            Create a few stories and characters to get personalized recommendations!
          </p>
          <Button onClick={() => window.location.href = '/stories/create'}>
            Create Your First Story
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {!quick && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            📚 Story Recommendations
          </h2>
          <Button variant="outline" onClick={loadRecommendations}>
            Refresh
          </Button>
        </div>
      )}

      <div className={quick ? "space-y-3" : "grid gap-6 md:grid-cols-2"}>
        {recommendations.map((recommendation, index) => (
          <Card 
            key={recommendation.id}
            animation="scale"
            delay={index * 75}
            className={`relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-l-4 ${
              recommendation.matchScore >= 90 
                ? 'border-l-green-500 bg-green-50' 
                : recommendation.matchScore >= 80 
                ? 'border-l-blue-500 bg-blue-50'
                : 'border-l-orange-500 bg-orange-50'
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-bold text-gray-800 leading-tight">
                    {recommendation.title}
                  </CardTitle>
                  <p className="text-sm text-purple-600 font-medium mt-1">
                    {recommendation.recommendationReason}
                  </p>
                </div>
                {!quick && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismiss(recommendation.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {recommendation.summary}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {recommendation.themes.map((theme) => (
                  <span
                    key={theme}
                    className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                  >
                    {theme}
                  </span>
                ))}
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {recommendation.estimatedReadTime} min read
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500">Match:</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-xs ${
                            i < Math.round(recommendation.matchScore / 20)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      ({recommendation.matchScore}%)
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => handleRecommendationClick(recommendation)}
                  size={quick ? "sm" : "md"}
                  className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 transition-all duration-300 hover:scale-105"
                >
                  Create Story
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {quick && recommendations.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <Button
              variant="outline"
              onClick={() => window.location.href = `/recommendations?childProfileId=${childProfileId}`}
              className="border-purple-300 text-purple-700 hover:bg-purple-100"
            >
              See All Recommendations →
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
