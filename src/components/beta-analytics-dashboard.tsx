'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading'
import { analyticsAnimations, consistencyAnimations } from '@/lib/animations'

interface CharacterConsistencyData {
  characterId: string
  characterName: string
  totalStoryAppearances: number
  overallConsistencyScore: number
  consistencyBreakdown: {
    visualConsistency: number
    personalityConsistency: number
    speechPatternConsistency: number
    behaviorConsistency: number
  }
  consistencyTrend: 'improving' | 'stable' | 'declining'
  recentInconsistencies: string[]
  recommendedImprovements: string[]
}

interface EngagementData {
  overview: {
    totalCharacters: number
    totalStories: number
    totalProfiles: number
    recentActivity: number
  }
  engagement: {
    characterReuseRate: number
    averageStoriesPerProfile: number
    averageCharactersPerProfile: number
    readingStreak: number
  }
  characterUsage: Array<{
    id: string
    name: string
    usageCount: number
    lastUsed: Date | null
    consistencyScore: number
  }>
  preferences: {
    favoriteThemes: Array<{ theme: string; count: number }>
  }
  engagementScore: number
}

interface BetaAnalyticsDashboardProps {
  childProfileId?: string
  characterId?: string
}

export function BetaAnalyticsDashboard({ childProfileId, characterId }: BetaAnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [engagementData, setEngagementData] = useState<EngagementData | null>(null)
  const [characterConsistency, setCharacterConsistency] = useState<CharacterConsistencyData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadAnalyticsData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Load engagement data
      const engagementResponse = await fetch(
        `/api/analytics?type=dashboard-summary${childProfileId ? `&childProfileId=${childProfileId}` : ''}`
      )
      
      if (engagementResponse.ok) {
        const data = await engagementResponse.json()
        setEngagementData(data.summary)
      }

      // Load character consistency data if specific character selected
      if (characterId) {
        const consistencyResponse = await fetch(
          `/api/analytics?type=character-consistency&characterId=${characterId}`
        )
        
        if (consistencyResponse.ok) {
          const data = await consistencyResponse.json()
          setCharacterConsistency(data.report)
        }
      }

    } catch (err) {
      setError('Failed to load analytics data')
      console.error('Analytics loading error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [childProfileId, characterId])

  useEffect(() => {
    loadAnalyticsData()
  }, [loadAnalyticsData])

  const getConsistencyColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConsistencyBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800'
    if (score >= 75) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈'
      case 'declining': return '📉'
      default: return '➡️'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <LoadingSpinner />
          <span className="ml-2">Loading analytics...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadAnalyticsData} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  const tabs = [
    { id: 'overview', label: '📊 Overview', icon: '📊' },
    { id: 'consistency', label: '🎭 Character Consistency', icon: '🎭' },
    { id: 'engagement', label: '💫 Engagement', icon: '💫' },
    { id: 'insights', label: '🔍 Insights', icon: '🔍' }
  ]

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "primary" : "outline"}
            onClick={() => setActiveTab(tab.id)}
            className="whitespace-nowrap min-w-fit"
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && engagementData && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600">
                {engagementData.overview.totalCharacters}
              </div>
              <div className="text-sm text-gray-600">Characters Created</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">
                {engagementData.overview.totalStories}
              </div>
              <div className="text-sm text-gray-600">Stories Generated</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600">
                {engagementData.engagement.characterReuseRate}%
              </div>
              <div className="text-sm text-gray-600">Character Reuse Rate</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600">
                {engagementData.engagementScore}
              </div>
              <div className="text-sm text-gray-600">Engagement Score</div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'consistency' && (
        <div className="space-y-6">
          {characterConsistency ? (
            <div className="space-y-4">
              <Card className={analyticsAnimations.metricCard}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{characterConsistency.characterName}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                        getConsistencyBadgeColor(characterConsistency.overallConsistencyScore)
                      } ${analyticsAnimations.scoreCountUp}`}>
                        {characterConsistency.overallConsistencyScore}% Overall
                      </span>
                      <span className={`text-lg ${consistencyAnimations.trendIndicator(characterConsistency.consistencyTrend)}`}>
                        {getTrendIcon(characterConsistency.consistencyTrend)}
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className={`text-2xl font-bold transition-all duration-500 ${getConsistencyColor(characterConsistency.consistencyBreakdown.visualConsistency)} ${analyticsAnimations.scoreCountUp}`}>
                        {characterConsistency.consistencyBreakdown.visualConsistency}%
                      </div>
                      <div className="text-sm text-gray-600">Visual</div>
                      <div className={`w-full bg-gray-200 rounded-full h-2 mt-2 ${analyticsAnimations.progressBar}`}>
                        <div 
                          className={consistencyAnimations.scoreBar(characterConsistency.consistencyBreakdown.visualConsistency)}
                          style={{ width: `${characterConsistency.consistencyBreakdown.visualConsistency}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold transition-all duration-500 ${getConsistencyColor(characterConsistency.consistencyBreakdown.personalityConsistency)} ${analyticsAnimations.scoreCountUp}`}>
                        {characterConsistency.consistencyBreakdown.personalityConsistency}%
                      </div>
                      <div className="text-sm text-gray-600">Personality</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getConsistencyColor(characterConsistency.consistencyBreakdown.speechPatternConsistency)}`}>
                        {characterConsistency.consistencyBreakdown.speechPatternConsistency}%
                      </div>
                      <div className="text-sm text-gray-600">Speech</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getConsistencyColor(characterConsistency.consistencyBreakdown.behaviorConsistency)}`}>
                        {characterConsistency.consistencyBreakdown.behaviorConsistency}%
                      </div>
                      <div className="text-sm text-gray-600">Behavior</div>
                    </div>
                  </div>

                  {characterConsistency.recommendedImprovements.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">💡 Recommended Improvements:</h4>
                      <ul className="space-y-1">
                        {characterConsistency.recommendedImprovements.map((improvement, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <span className="mr-2">•</span>
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-600 mb-4">Select a character to view consistency metrics</p>
                <Button onClick={() => window.location.href = '/characters'} variant="outline">
                  Browse Characters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'engagement' && engagementData && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">📚 Reading Activity</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Reading Streak</span>
                    <span className="font-medium">{engagementData.engagement.readingStreak} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recent Activity</span>
                    <span className="font-medium">{engagementData.overview.recentActivity} stories this week</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stories per Profile</span>
                    <span className="font-medium">{engagementData.engagement.averageStoriesPerProfile}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">🎭 Character Usage</h3>
                <div className="space-y-3">
                  {engagementData.characterUsage.slice(0, 3).map((character) => (
                    <div key={character.id} className="flex items-center justify-between">
                      <span className="text-sm">{character.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{character.usageCount} stories</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          getConsistencyBadgeColor(character.consistencyScore)
                        }`}>
                          {character.consistencyScore}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">🎨 Favorite Themes</h3>
              <div className="flex flex-wrap gap-2">
                {engagementData.preferences.favoriteThemes.map((theme, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {theme.theme} ({theme.count})
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'insights' && engagementData && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">🔍 Personalized Insights</h3>
              <div className="space-y-4">
                {engagementData.engagement.characterReuseRate > 70 ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start">
                      <span className="text-green-500 mr-3 text-lg">✅</span>
                      <div>
                        <div className="font-medium text-green-800">Great Character Development!</div>
                        <div className="text-sm text-green-700">
                          You&apos;re doing excellent at developing consistent characters across multiple stories.
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start">
                      <span className="text-blue-500 mr-3 text-lg">💡</span>
                      <div>
                        <div className="font-medium text-blue-800">Try Character Continuation</div>
                        <div className="text-sm text-blue-700">
                          Consider using your existing characters in new adventures to build stronger character development.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {engagementData.engagement.readingStreak > 7 ? (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-start">
                      <span className="text-purple-500 mr-3 text-lg">🔥</span>
                      <div>
                        <div className="font-medium text-purple-800">Amazing Reading Streak!</div>
                        <div className="text-sm text-purple-700">
                          {engagementData.engagement.readingStreak} days of consistent reading is fantastic for development.
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start">
                      <span className="text-orange-500 mr-3 text-lg">📚</span>
                      <div>
                        <div className="font-medium text-orange-800">Build a Reading Routine</div>
                        <div className="text-sm text-orange-700">
                          Try reading stories more regularly to build engagement and character familiarity.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-start">
                    <span className="text-gray-500 mr-3 text-lg">🎯</span>
                    <div>
                      <div className="font-medium text-gray-800">Next Steps</div>
                      <div className="text-sm text-gray-700">
                        Based on your activity, we recommend exploring new themes while continuing to develop your favorite characters.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
