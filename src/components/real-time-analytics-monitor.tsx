'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

interface CharacterConsistency {
  consistencyScore: number;
  visualConsistencyScore?: number;
  personalityConsistencyScore?: number;
  speechConsistencyScore?: number;
}

interface RealTimeFeedback {
  visualConsistency: number
  personalityConsistency: number
  speechConsistency: number
  behaviorConsistency: number
  overallScore: number
  warnings: string[]
  suggestions: string[]
}

interface RealTimeAnalytics {
  basicConsistency: CharacterConsistency
  enhancedConsistency: CharacterConsistency
  realTimeFeedback: RealTimeFeedback
  suggestions: Array<{
    type: string
    priority: string
    message: string
    details: string
  }>
}

interface StoryContext {
  theme?: string;
  [key: string]: unknown;
}

interface RealTimeAnalyticsMonitorProps {
  characterId: string
  storyContent: string
  storyContext?: StoryContext
  onAnalyticsUpdate?: (analytics: RealTimeAnalytics) => void
  className?: string
}

export function RealTimeAnalyticsMonitor({
  characterId,
  storyContent,
  storyContext,
  onAnalyticsUpdate,
  className = ''
}: RealTimeAnalyticsMonitorProps) {
  const [analytics, setAnalytics] = useState<RealTimeAnalytics | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounce story content analysis
  const debouncedAnalysis = useCallback((content: string) => {
    const timeout = setTimeout(async () => {
      if (!content.trim() || content.length < 50) return

      setIsAnalyzing(true)
      setError(null)

      try {
        const response = await fetch('/api/analytics/real-time', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            characterId,
            storyContent: content,
            storyContext,
            realTimeMode: true
          })
        })

        if (!response.ok) {
          throw new Error('Failed to analyze content')
        }

        const data = await response.json()
        setAnalytics(data.analytics)
        onAnalyticsUpdate?.(data.analytics)

      } catch (err) {
        console.error('Real-time analysis error:', err)
        setError('Failed to analyze story content')
      } finally {
        setIsAnalyzing(false)
      }
    }, 2000)

    return () => clearTimeout(timeout)
  }, [characterId, storyContext, onAnalyticsUpdate])

  useEffect(() => {
    debouncedAnalysis(storyContent)
  }, [storyContent, debouncedAnalysis])

  const consistencyLevels = useMemo(() => {
    if (!analytics?.realTimeFeedback) return []

    return [
      {
        label: 'Visual',
        value: analytics.realTimeFeedback.visualConsistency,
        color: getConsistencyColor(analytics.realTimeFeedback.visualConsistency)
      },
      {
        label: 'Personality',
        value: analytics.realTimeFeedback.personalityConsistency,
        color: getConsistencyColor(analytics.realTimeFeedback.personalityConsistency)
      },
      {
        label: 'Speech',
        value: analytics.realTimeFeedback.speechConsistency,
        color: getConsistencyColor(analytics.realTimeFeedback.speechConsistency)
      },
      {
        label: 'Behavior',
        value: analytics.realTimeFeedback.behaviorConsistency,
        color: getConsistencyColor(analytics.realTimeFeedback.behaviorConsistency)
      }
    ]
  }, [analytics])

  const overallScore = analytics?.realTimeFeedback?.overallScore || 0
  const warnings = analytics?.realTimeFeedback?.warnings || []
  const suggestions = analytics?.suggestions || []

  if (!characterId || !storyContent) {
    return null
  }

  return (
    <Card className={`${className} border-l-4 border-l-blue-500`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="text-blue-600">📊</span>
          Real-Time Character Analysis
          {isAnalyzing && (
            <div className="ml-auto">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analytics && (
          <>
            {/* Overall Score */}
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-800 mb-1">
                {overallScore}%
              </div>
              <div className="text-sm text-gray-600">
                Overall Consistency Score
              </div>
              <Progress 
                value={overallScore} 
                className="mt-2"
                style={{
                  background: `linear-gradient(to right, ${getConsistencyColor(overallScore)}, ${getConsistencyColor(overallScore)}30)`
                }}
              />
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-2 gap-3">
              {consistencyLevels.map((level) => (
                <div 
                  key={level.label}
                  className="p-3 bg-white border rounded-lg shadow-sm"
                  style={{
                    // Remove animation reference since it doesn't exist
                    opacity: 1
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {level.label}
                    </span>
                    <Badge 
                      variant="outline"
                      className="text-xs"
                      style={{ borderColor: level.color, color: level.color }}
                    >
                      {Math.round(level.value)}%
                    </Badge>
                  </div>
                  <Progress 
                    value={level.value} 
                    className="h-2"
                    style={{
                      background: `linear-gradient(to right, ${level.color}, ${level.color}30)`
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-orange-700 flex items-center gap-1">
                  ⚠️ Areas for Improvement
                </h4>
                {warnings.map((warning, index) => (
                  <Alert key={index} className="border-orange-200 bg-orange-50">
                    <AlertDescription className="text-sm text-orange-700">
                      {warning}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-green-700 flex items-center gap-1">
                  💡 Suggestions
                </h4>
                {suggestions.map((suggestion, index) => (
                  <Alert 
                    key={index} 
                    className={`${getSuggestionStyle(suggestion.priority)} border-l-4`}
                  >
                    <AlertDescription className="text-sm">
                      <div className="font-medium mb-1">{suggestion.message}</div>
                      <div className="text-xs opacity-90">{suggestion.details}</div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {/* Real-time Feedback Summary */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-2">
                Last analyzed: {new Date().toLocaleTimeString()}
              </div>
              <div className="text-sm text-gray-700">
                {getOverallFeedback(overallScore)}
              </div>
            </div>
          </>
        )}

        {!analytics && !isAnalyzing && storyContent.length > 0 && (
          <div className="text-center py-4 text-gray-500">
            <div className="text-sm">Start writing to see real-time analysis...</div>
            <div className="text-xs mt-1">Minimum 50 characters needed</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function getConsistencyColor(score: number): string {
  if (score >= 80) return '#10b981' // green-500
  if (score >= 60) return '#f59e0b' // amber-500
  if (score >= 40) return '#f97316' // orange-500
  return '#ef4444' // red-500
}

function getSuggestionStyle(priority: string): string {
  switch (priority) {
    case 'high':
      return 'border-red-200 bg-red-50 border-l-red-500'
    case 'medium':
      return 'border-yellow-200 bg-yellow-50 border-l-yellow-500'
    case 'low':
      return 'border-green-200 bg-green-50 border-l-green-500'
    default:
      return 'border-blue-200 bg-blue-50 border-l-blue-500'
  }
}

function getOverallFeedback(score: number): string {
  if (score >= 85) return "Excellent character consistency! The character is very well represented."
  if (score >= 70) return "Good character consistency. Minor improvements could enhance the story."
  if (score >= 50) return "Moderate consistency. Consider adding more character details."
  if (score >= 30) return "Low consistency. The character needs more development in this story."
  return "Very low consistency. Focus on incorporating the character's key traits."
}
