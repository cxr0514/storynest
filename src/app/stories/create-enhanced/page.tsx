'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AnimatedPage } from '@/components/ui/animated-page'
import { LoadingSpinner } from '@/components/ui/loading'
import { StoryEditor } from '@/components/story-editor-with-analytics'
import { useSubscription } from '@/hooks/useSubscription'
import { ChildProfile, Character, StoryTheme } from '@/types'

export default function CreateStoryEnhanced() {
  const router = useRouter()
  const { data: session } = useSession()
  const { subscription, loading: subscriptionLoading } = useSubscription()
  
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([])
  const [availableCharacters, setAvailableCharacters] = useState<Character[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Form state
  const [selectedChild, setSelectedChild] = useState<string>('')
  const [selectedTheme, setSelectedTheme] = useState<StoryTheme | ''>('')
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([])
  const [moralLesson, setMoralLesson] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [showEditor, setShowEditor] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, router])

  useEffect(() => {
    const loadChildProfiles = async () => {
      try {
        const response = await fetch('/api/child-profiles')
        if (response.ok) {
          const profiles = await response.json()
          setChildProfiles(profiles)
          
          if (profiles.length > 0) {
            setSelectedChild(profiles[0].id)
            // Load characters for the first child
            const charactersResponse = await fetch(`/api/characters?childProfileId=${profiles[0].id}`)
            if (charactersResponse.ok) {
              const characters = await charactersResponse.json()
              setAvailableCharacters(characters)
            }
          }
        }
      } catch (error) {
        console.error('Error loading child profiles:', error)
        setErrors(['Failed to load child profiles'])
      } finally {
        setIsLoading(false)
      }
    }

    loadChildProfiles()
  }, [])

  useEffect(() => {
    const loadCharactersForChild = async () => {
      if (selectedChild) {
        try {
          const response = await fetch(`/api/characters?childProfileId=${selectedChild}`)
          if (response.ok) {
            const characters = await response.json()
            setAvailableCharacters(characters)
            setSelectedCharacters([]) // Reset character selection when child changes
          }
        } catch (error) {
          console.error('Error loading characters:', error)
          setAvailableCharacters([])
        }
      }
    }

    loadCharactersForChild()
  }, [selectedChild])

  const toggleCharacter = (characterId: string) => {
    setSelectedCharacters(prev => 
      prev.includes(characterId) 
        ? prev.filter(id => id !== characterId)
        : [...prev, characterId].slice(0, 3) // Max 3 characters
    )
  }

  const handleProceedToEditor = () => {
    if (!selectedChild || !selectedTheme || selectedCharacters.length === 0) {
      setErrors(['Please select a child, theme, and at least one character'])
      return
    }

    // Check subscription limits
    if (subscription && !subscriptionLoading) {
      const { usage } = subscription
      
      // Check if user has reached story limit
      if (usage.storiesLimit !== -1 && usage.storiesThisMonth >= usage.storiesLimit && usage.credits === 0) {
        setErrors([
          `You've reached your monthly limit of ${usage.storiesLimit} stories. `,
          'Upgrade your plan or purchase credits to continue creating stories.'
        ])
        return
      }
    }

    setErrors([])
    setShowEditor(true)
  }

  const handleStoryCreated = (storyId: string) => {
    router.push(`/stories/${storyId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner variant="magic" size="lg" />
          </div>
        </main>
      </div>
    )
  }

  if (showEditor) {
    return (
      <StoryEditor
        childProfileId={selectedChild}
        selectedCharacters={selectedCharacters}
        selectedTheme={selectedTheme as StoryTheme}
        moralLesson={moralLesson}
        onStoryCreate={handleStoryCreated}
      />
    )
  }

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <Header />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent mb-2">
              Create Enhanced Story with Analytics
            </h1>
            <p className="text-gray-600">
              Create stories with real-time character consistency feedback and enhanced analytics
            </p>
          </div>

          {errors.length > 0 && (
            <Card className="mb-6 p-4 border-red-200 bg-red-50 animate-slide-in">
              <CardContent className="p-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-500 animate-bounce">⚠️</span>
                  <h4 className="font-semibold text-red-800">Please fix the following:</h4>
                </div>
                <ul className="list-disc list-inside text-red-700 text-sm">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card variant="glass" className="p-8 animate-scale-in hover:shadow-xl transition-all duration-300">
            <CardContent className="space-y-6 p-0">
              {/* Beta Feature Badge */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm rounded-full font-medium">
                    ✨ Beta Analytics
                  </div>
                  <span className="text-gray-600 text-sm">Real-time character consistency monitoring</span>
                </div>
              </div>

              {/* Child Profile Selection */}
              <div className="scroll-animate" data-animation="fade-up">
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  Select Child Profile
                </label>
                {childProfiles.length === 0 ? (
                  <Card className="p-6 text-center border-dashed border-2 border-gray-300 animate-pulse">
                    <CardContent className="p-0">
                      <p className="text-gray-600 mb-4">No child profiles found. Create one first!</p>
                      <Button onClick={() => router.push('/dashboard')} variant="gradient">
                        Go to Dashboard
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {childProfiles.map((profile, index) => (
                      <Card 
                        key={profile.id}
                        hover 
                        className={`p-4 cursor-pointer transition-all duration-300 hover:scale-105 animate-fade-in ${
                          selectedChild === profile.id ? 'border-2 border-orange-500 bg-orange-50 ring-2 ring-orange-200' : ''
                        }`}
                        style={{ animationDelay: `${index * 100}ms` }}
                        onClick={() => setSelectedChild(profile.id)}
                      >
                        <CardContent className="text-center p-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center mb-2 mx-auto animate-gentle-bounce">
                            <span className="text-white font-bold">{profile.name[0]}</span>
                          </div>
                          <p className="font-medium">{profile.name} ({profile.age})</p>
                          <p className="text-xs text-gray-600">
                            {(profile.interests || []).slice(0, 2).join(', ')}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Story Theme */}
              <div className="scroll-animate" data-animation="fade-up" data-delay="200">
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  Story Theme
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { theme: 'fantasy', emoji: '🏰', label: 'Fantasy' },
                    { theme: 'space', emoji: '🚀', label: 'Space' },
                    { theme: 'ocean', emoji: '🌊', label: 'Ocean' },
                    { theme: 'magic', emoji: '🦄', label: 'Magic' },
                    { theme: 'adventure', emoji: '🏝️', label: 'Adventure' },
                    { theme: 'circus', emoji: '🎪', label: 'Circus' },
                    { theme: 'dreams', emoji: '🌟', label: 'Dreams' },
                    { theme: 'creative', emoji: '🎨', label: 'Creative' }
                  ].map((themeOption, index) => (
                    <Button
                      key={themeOption.theme}
                      variant={selectedTheme === themeOption.theme ? 'gradient' : 'outline'}
                      className={`h-20 flex flex-col gap-2 transition-all duration-300 hover:scale-110 animate-fade-in ${
                        selectedTheme === themeOption.theme ? 'ring-2 ring-orange-300' : ''
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => setSelectedTheme(themeOption.theme as StoryTheme)}
                    >
                      <span className="text-2xl animate-gentle-bounce">{themeOption.emoji}</span>
                      <span className="text-sm">{themeOption.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Characters */}
              <div className="scroll-animate" data-animation="fade-up" data-delay="400">
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  Choose Characters (max 3)
                  <span className="text-sm text-orange-600 ml-2">• Analytics enabled</span>
                </label>
                {availableCharacters.length === 0 ? (
                  <Card className="p-6 text-center border-dashed border-2 border-gray-300 animate-pulse">
                    <CardContent className="p-0">
                      <p className="text-gray-600 mb-4">No characters found for this child.</p>
                      <Button 
                        variant="outline" 
                        onClick={() => router.push('/characters/create')}
                        className="hover:scale-105 transition-transform duration-200"
                      >
                        Create Your First Character
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {availableCharacters.map((character, index) => (
                      <div 
                        key={character.id}
                        className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] animate-slide-in ${
                          selectedCharacters.includes(character.id)
                            ? 'border-2 border-orange-300 bg-orange-50 shadow-md'
                            : 'border hover:border-orange-300 hover:bg-orange-50 hover:shadow-sm'
                        }`}
                        style={{ animationDelay: `${index * 100}ms` }}
                        onClick={() => toggleCharacter(character.id)}
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center animate-gentle-bounce">
                          <span className="text-white text-xl">
                            {character.species === 'animal' ? '🐾' : 
                             character.species === 'magical' ? '✨' : '👤'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{character.name}</h4>
                          <p className="text-sm text-gray-600">{character.personalityDescription}</p>
                          <div className="flex gap-1 mt-1">
                            {character.personalityTraits.slice(0, 3).map((trait, traitIndex) => (
                              <span 
                                key={trait} 
                                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded animate-fade-in"
                                style={{ animationDelay: `${(index * 100) + (traitIndex * 50)}ms` }}
                              >
                                {trait}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <input 
                            type="checkbox" 
                            checked={selectedCharacters.includes(character.id)}
                            onChange={() => toggleCharacter(character.id)}
                            className="w-5 h-5 text-orange-500 transition-transform duration-200 hover:scale-110"
                          />
                          {/* Temporarily disabled metadata display until schema supports it */}
                          {false && character.name && (
                            <span className="text-xs text-purple-600">
                              📊 Analytics
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <Button 
                      variant="outline" 
                      className="w-full hover:scale-[1.02] transition-all duration-200 animate-fade-in"
                      onClick={() => router.push('/characters/create')}
                    >
                      ✨ Create New Character
                    </Button>
                  </div>
                )}
              </div>

              {/* Moral/Lesson */}
              <div className="scroll-animate" data-animation="fade-up" data-delay="600">
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  Lesson or Moral (Optional)
                </label>
                <select 
                  value={moralLesson}
                  onChange={(e) => setMoralLesson(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 hover:border-orange-300"
                >
                  <option value="">Choose a lesson...</option>
                  <option value="friendship">💝 Friendship and kindness</option>
                  <option value="courage">🦁 Being brave</option>
                  <option value="honesty">🌟 Telling the truth</option>
                  <option value="sharing">🤝 Sharing and caring</option>
                  <option value="perseverance">💪 Never giving up</option>
                  <option value="respect">🌸 Respecting others</option>
                </select>
              </div>

              <div className="flex gap-4 pt-6 scroll-animate" data-animation="fade-up" data-delay="700">
                <Button 
                  variant="outline" 
                  className="flex-1 hover:scale-105 transition-all duration-200"
                  onClick={() => router.push('/stories/create')}
                >
                  Use Basic Creator
                </Button>
                <Button 
                  className="flex-1" 
                  size="lg"
                  onClick={handleProceedToEditor}
                  disabled={!selectedChild || !selectedTheme || selectedCharacters.length === 0}
                  variant="magical"
                >
                  📊 Continue with Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </AnimatedPage>
  )
}
