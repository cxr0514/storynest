'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'

interface CharacterMetrics {
  id: string
  name: string
  childProfile: string
  species: string
  appearances: number
  uniqueThemes: number
  favoriteThemes: string[]
  lastUsed: string
  consistencyScore: number
  consistencyTrend: 'improving' | 'stable' | 'declining'
}

interface AnalyticsSummary {
  totalCharacters: number
  averageConsistency: number
  mostUsedCharacter: string | null
  highestConsistency: number
  charactersNeedingAttention: number
}

interface AnalyticsOverviewProps {
  childProfileId?: string
  className?: string
}

export function AnalyticsOverview({ childProfileId, className = '' }: AnalyticsOverviewProps) {
  const { data: session } = useSession()
  const [characters, setCharacters] = useState<CharacterMetrics[]>([])
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadAnalytics = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        type: 'character-overview',
        ...(childProfileId && { childProfileId })
      })
      
      const response = await fetch(`/api/analytics?${params}`)
      if (response.ok) {
        const data = await response.json()
        setCharacters(data.overview.characters)
        setSummary(data.overview.summary)
      } else {
        setError('Failed to load analytics')
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
      setError('Error loading analytics')
    } finally {
      setIsLoading(false)
    }
  }, [childProfileId])

  useEffect(() => {
    if (session) {
      loadAnalytics()
    }
  }, [session, childProfileId, loadAnalytics])

  const getConsistencyColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100'
    if (score >= 80) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈'
      case 'declining': return '📉'
      default: return '➡️'
    }
  }

  const getSpeciesEmoji = (species: string) => {
    const emojis: Record<string, string> = {
      'animal': '🐾',
      'human': '👤',
      'magical': '✨',
      'robot': '🤖',
      'fairy': '🧚',
      'other': '❓'
    }
    return emojis[species] || '❓'
  }

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center">
                  <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button variant="outline" onClick={loadAnalytics}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!summary || characters.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Analytics Data</h3>
          <p className="text-gray-600 mb-4">
            Create some characters and stories to see analytics!
          </p>
          <Button onClick={() => window.location.href = '/characters/create'}>
            Create Your First Character
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">📊 Character Analytics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {summary.totalCharacters}
              </div>
              <div className="text-sm text-blue-700">Total Characters</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {summary.averageConsistency}%
              </div>
              <div className="text-sm text-green-700">Avg Consistency</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {summary.highestConsistency}%
              </div>
              <div className="text-sm text-purple-700">Best Score</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {summary.charactersNeedingAttention}
              </div>
              <div className="text-sm text-orange-700">Need Attention</div>
            </div>
          </div>
          
          {summary.mostUsedCharacter && (
            <div className="mt-4 text-center text-sm text-blue-700">
              🌟 Most Popular: <strong>{summary.mostUsedCharacter}</strong>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Character List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">Character Performance</h3>
          <Button variant="outline" onClick={loadAnalytics}>
            Refresh
          </Button>
        </div>
        
        <div className="grid gap-4">
          {characters.map((character) => (
            <Card key={character.id} className="transition-all duration-200 hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="text-3xl">
                      {getSpeciesEmoji(character.species)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-semibold text-gray-800">
                          {character.name}
                        </h4>
                        <span className="text-sm text-gray-500">
                          ({character.childProfile})
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Appearances:</span>
                          <div className="font-semibold">{character.appearances}</div>
                        </div>
                        
                        <div>
                          <span className="text-gray-500">Themes:</span>
                          <div className="font-semibold">{character.uniqueThemes}</div>
                        </div>
                        
                        <div>
                          <span className="text-gray-500">Last Used:</span>
                          <div className="font-semibold">
                            {new Date(character.lastUsed).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-gray-500">Trend:</span>
                          <div className="font-semibold">
                            {getTrendIcon(character.consistencyTrend)} {character.consistencyTrend}
                          </div>
                        </div>
                      </div>
                      
                      {character.favoriteThemes.length > 0 && (
                        <div className="mt-3">
                          <span className="text-xs text-gray-500">Favorite Themes:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {character.favoriteThemes.map((theme) => (
                              <span
                                key={theme}
                                className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                              >
                                {theme}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-center ml-4">
                    <div className={`text-lg font-bold px-3 py-1 rounded-full ${getConsistencyColor(character.consistencyScore)}`}>
                      {character.consistencyScore}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Consistency</div>
                  </div>
                </div>
                
                {/* Consistency Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Consistency Score</span>
                    <span>{character.consistencyScore}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        character.consistencyScore >= 90
                          ? 'bg-green-500'
                          : character.consistencyScore >= 80
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${character.consistencyScore}%` }}
                    />
                  </div>
                </div>
                
                {character.consistencyScore < 80 && (
                  <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-orange-600">⚠️</span>
                      <span className="text-sm text-orange-700">
                        This character could benefit from more consistent storytelling
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Tips for Improvement */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">💡 Tips for Better Character Consistency</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-green-700">
            <div className="space-y-2">
              <p className="flex items-start">
                <span className="mr-2">🎭</span>
                <span>Keep detailed character profiles with specific traits</span>
              </p>
              <p className="flex items-start">
                <span className="mr-2">📝</span>
                <span>Reference previous stories when creating new ones</span>
              </p>
            </div>
            <div className="space-y-2">
              <p className="flex items-start">
                <span className="mr-2">🎨</span>
                <span>Maintain consistent visual descriptions</span>
              </p>
              <p className="flex items-start">
                <span className="mr-2">💬</span>
                <span>Use character-specific speech patterns and phrases</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
