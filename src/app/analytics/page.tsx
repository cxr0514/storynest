'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { BetaAnalyticsDashboard } from '@/components/beta-analytics-dashboard'
import { BetaRecommendationEngine } from '@/components/beta-recommendation-engine'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading'
import { AnimatedPage } from '@/components/ui/animated-page'

interface ChildProfile {
  id: string
  name: string
  age: number
}

interface Character {
  id: string
  name: string
  species: string
  childProfileId: string
}

export default function AnalyticsPage() {
  const { status } = useSession()
  const router = useRouter()
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([])
  const [characters, setCharacters] = useState<Character[]>([])
  const [selectedChild, setSelectedChild] = useState<string>('all')
  const [selectedCharacter, setSelectedCharacter] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      loadData()
    }
  }, [status, router])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Load child profiles
      const profilesResponse = await fetch('/api/child-profiles')
      if (profilesResponse.ok) {
        const profiles = await profilesResponse.json()
        setChildProfiles(profiles)
      }

      // Load characters
      const charactersResponse = await fetch('/api/characters')
      if (charactersResponse.ok) {
        const charactersData = await charactersResponse.json()
        setCharacters(charactersData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter characters based on selected child profile
  const filteredCharacters = selectedChild === 'all' 
    ? characters 
    : characters.filter(char => char.childProfileId === selectedChild)

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <LoadingSpinner />
              <span className="ml-2">Loading analytics...</span>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <Header />
        
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent mb-4">
              📊 Analytics Dashboard
            </h1>
            <p className="text-gray-600 text-lg mb-6">
              Track character consistency and story engagement with advanced analytics
            </p>
            
            {/* Beta Feature Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
              <Button
                onClick={() => router.push('/stories/create-enhanced')}
                variant="gradient"
                className="px-6 py-2"
              >
                📝 Create Story with Analytics
              </Button>
              <Button
                onClick={() => router.push('/characters/create')}
                variant="outline"
                className="px-6 py-2"
              >
                👤 Create Analytics-Enabled Character
              </Button>
            </div>
          </div>

          {/* Filter Controls */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Child Profile
                  </label>
                  <select
                    value={selectedChild}
                    onChange={(e) => {
                      setSelectedChild(e.target.value)
                      setSelectedCharacter('') // Reset character selection
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All Children</option>
                    {childProfiles.map(profile => (
                      <option key={profile.id} value={profile.id}>
                        {profile.name} (Age {profile.age})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Character (Optional)
                  </label>
                  <select
                    value={selectedCharacter}
                    onChange={(e) => setSelectedCharacter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled={filteredCharacters.length === 0}
                  >
                    <option value="">All Characters</option>
                    {filteredCharacters.map(character => (
                      <option key={character.id} value={character.id}>
                        {character.name} ({character.species})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredCharacters.length === 0 && selectedChild !== 'all' && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    No characters found for the selected child profile. 
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="ml-2"
                      onClick={() => router.push('/characters/create')}
                    >
                      Create Character
                    </Button>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Beta Analytics Dashboard */}
          <BetaAnalyticsDashboard 
            childProfileId={selectedChild === 'all' ? undefined : selectedChild}
            characterId={selectedCharacter || undefined}
          />

          {/* Beta Recommendations Section */}
          {selectedChild !== 'all' && (
            <Card className="mt-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">📊 Personalized Recommendations</h3>
                  <div className="text-sm text-gray-600">
                    Based on your analytics and usage patterns
                  </div>
                </div>
                <BetaRecommendationEngine
                  childProfileId={selectedChild}
                  characterIds={selectedCharacter ? [selectedCharacter] : filteredCharacters.map(c => c.id)}
                  currentStoryContext="analytics_dashboard"
                />
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card className="mt-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/characters/create')}
                  className="h-16 flex flex-col items-center justify-center"
                >
                  <span className="text-lg mb-1">🎭</span>
                  <span>Create Character</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/stories/create')}
                  className="h-16 flex flex-col items-center justify-center"
                >
                  <span className="text-lg mb-1">📚</span>
                  <span>Generate Story</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/recommendations')}
                  className="h-16 flex flex-col items-center justify-center"
                >
                  <span className="text-lg mb-1">💡</span>
                  <span>Get Recommendations</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </AnimatedPage>
  )
}
