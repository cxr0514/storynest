'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading'
import { analyticsAnimations, microAnimations, combineAnimations } from '@/lib/animations'

interface EnhancedRecommendation {
  id: string
  type: 'character_development' | 'story_theme' | 'narrative_style' | 'character_interaction'
  title: string
  description: string
  reasoning: string
  confidence: number
  impact: 'low' | 'medium' | 'high'
  implementationDifficulty: 'easy' | 'moderate' | 'challenging'
  personalizedFactors: string[]
  characterIds?: string[]
  actionable_steps: string[]
  priority: number
}

interface BetaRecommendationEngineProps {
  childProfileId?: string
  characterIds?: string[]
  currentStoryContext?: string
}

export function BetaRecommendationEngine({ 
  childProfileId, 
  characterIds = [], 
  currentStoryContext 
}: BetaRecommendationEngineProps) {
  const [recommendations, setRecommendations] = useState<EnhancedRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null)

  const loadRecommendations = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (childProfileId) params.append('childProfileId', childProfileId)
      if (characterIds.length > 0) params.append('characterIds', characterIds.join(','))
      if (currentStoryContext) params.append('context', currentStoryContext)
      params.append('enhanced', 'true') // Request Beta Phase enhanced recommendations

      const response = await fetch(`/api/recommendations?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setRecommendations(data.recommendations || [])
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error)
    } finally {
      setIsLoading(false)
    }
  }, [childProfileId, characterIds, currentStoryContext])

  useEffect(() => {
    loadRecommendations()
  }, [loadRecommendations])

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '🟢'
      case 'moderate': return '🟡'
      case 'challenging': return '🔴'
      default: return '⚪'
    }
  }

  const getConfidenceBar = (confidence: number) => {
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${confidence}%` }}
        />
      </div>
    )
  }

  const categories = [
    { id: 'all', label: 'All Recommendations', icon: '🎯' },
    { id: 'character_development', label: 'Character Development', icon: '👤' },
    { id: 'story_theme', label: 'Story Themes', icon: '📖' },
    { id: 'narrative_style', label: 'Narrative Style', icon: '✍️' },
    { id: 'character_interaction', label: 'Character Interactions', icon: '👥' }
  ]

  const filteredRecommendations = recommendations
    .filter(rec => selectedCategory === 'all' || rec.type === selectedCategory)
    .sort((a, b) => b.priority - a.priority)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <LoadingSpinner size="sm" />
          <span className="text-gray-600">Generating personalized recommendations...</span>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded-lg h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category, index) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className={combineAnimations(
              microAnimations.buttonPress,
              analyticsAnimations.metricCard,
              `delay-[${index * 100}ms]`
            )}
          >
            <span className="mr-2">{category.icon}</span>
            {category.label}
          </Button>
        ))}
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecommendations.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No recommendations available</h3>
              <p className="text-gray-600">
                Create more stories and characters to get personalized recommendations!
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRecommendations.map((recommendation, index) => (
            <Card 
              key={recommendation.id} 
              className={combineAnimations(
                analyticsAnimations.metricCard,
                microAnimations.cardHover,
                `delay-[${index * 150}ms]`,
                analyticsAnimations.chartAnimation,
                analyticsAnimations.chartAnimationActive
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{recommendation.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(recommendation.impact)}`}>
                        {recommendation.impact} impact
                      </span>
                      <span className="text-sm">
                        {getDifficultyIcon(recommendation.implementationDifficulty)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{recommendation.description}</p>
                    
                    {/* Confidence Score */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Confidence Score</span>
                        <span className="font-medium">{recommendation.confidence}%</span>
                      </div>
                      {getConfidenceBar(recommendation.confidence)}
                    </div>

                    {/* Personalized Factors */}
                    {recommendation.personalizedFactors.length > 0 && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-700">Based on: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {recommendation.personalizedFactors.map((factor, idx) => (
                            <span 
                              key={idx}
                              className={`px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs ${microAnimations.tagSelect}`}
                            >
                              {factor}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expandable Details */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedRecommendation(
                    expandedRecommendation === recommendation.id ? null : recommendation.id
                  )}
                  className={microAnimations.buttonPress}
                >
                  {expandedRecommendation === recommendation.id ? 'Hide Details' : 'Show Details'}
                  <span className={`ml-2 transition-transform duration-200 ${
                    expandedRecommendation === recommendation.id ? 'rotate-180' : ''
                  }`}>
                    ▼
                  </span>
                </Button>

                {expandedRecommendation === recommendation.id && (
                  <div className={`mt-4 space-y-4 border-t pt-4 ${analyticsAnimations.insightSlideIn} ${analyticsAnimations.insightSlideInActive}`}>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Why this recommendation?</h4>
                      <p className="text-gray-600 text-sm">{recommendation.reasoning}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Action Steps</h4>
                      <ul className="space-y-1">
                        {recommendation.actionable_steps.map((step, idx) => (
                          <li key={idx} className="flex items-start text-sm text-gray-600">
                            <span className="text-orange-500 mr-2">•</span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {recommendation.characterIds && recommendation.characterIds.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Related Characters</h4>
                        <div className="text-sm text-gray-600">
                          Applies to: {recommendation.characterIds.join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Quick Actions */}
      {filteredRecommendations.length > 0 && (
        <Card className={analyticsAnimations.metricCard}>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">Quick Actions</h4>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className={microAnimations.buttonPress}
              >
                📊 View Analytics
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className={microAnimations.buttonPress}
              >
                ✨ Create Character
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className={microAnimations.buttonPress}
              >
                📝 Start Story
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className={microAnimations.buttonPress}
              >
                🔄 Refresh Recommendations
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default BetaRecommendationEngine
