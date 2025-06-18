'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AnimatedPage } from '@/components/ui/animated-page'
// import { useSubscription } from '@/hooks/useSubscription' // Temporarily disabled
import { ChildProfile, Character, StoryTheme } from '@/types'

export default function CreateStory() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preSelectedChildId = searchParams.get('childId')
  const { data: session } = useSession()
  // const { subscription, loading: subscriptionLoading } = useSubscription() // Temporarily disabled
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([])
  const [availableCharacters, setAvailableCharacters] = useState<Character[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadingTimeout, setLoadingTimeout] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Form state
  const [selectedChild, setSelectedChild] = useState<string>('')
  const [selectedTheme, setSelectedTheme] = useState<StoryTheme | ''>('')
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([])
  const [customPrompt, setCustomPrompt] = useState('')
  const [moralLesson, setMoralLesson] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  // Redirect if not authenticated
  useEffect(() => {
    console.log('🔍 Auth status:', { session, loading: !session })
    if (!session && typeof window !== 'undefined') {
      console.log('🚫 Not authenticated, redirecting...')
      router.push('/auth/signin')
      return
    }
  }, [session, router])

  // Emergency timeout to prevent infinite loading
  useEffect(() => {
    const emergencyTimeout = setTimeout(() => {
      console.log('🚨 Emergency timeout triggered - stopping infinite loading')
      setLoadingTimeout(true)
      setIsLoading(false)
    }, 15000) // 15 seconds max loading time

    return () => clearTimeout(emergencyTimeout)
  }, [router])

  useEffect(() => {
    console.log('🔄 Starting loadChildProfiles...')
    const loadChildProfiles = async () => {
      try {
        console.log('📡 Fetching child profiles...')
        
        // Add timeout protection
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
        
        const response = await fetch('/api/child-profiles', {
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        
        console.log('📡 Child profiles response:', response.status)
        
        if (response.ok) {
          const profiles = await response.json()
          console.log('✅ Child profiles loaded:', profiles)
          setChildProfiles(profiles)
          
          if (profiles.length > 0) {
            // If there's a pre-selected child ID from query params, use it
            const targetChildId = preSelectedChildId && profiles.find((p: ChildProfile) => p.id === preSelectedChildId) 
              ? preSelectedChildId 
              : profiles[0].id
              
            console.log('🎯 Setting selected child to:', targetChildId)
            setSelectedChild(targetChildId)
            
            // Load characters for the selected child
            console.log('📡 Fetching characters for child:', targetChildId)
            
            // Add timeout protection for characters API
            const charactersController = new AbortController()
            const charactersTimeoutId = setTimeout(() => charactersController.abort(), 10000)
            
            const charactersResponse = await fetch(`/api/characters?childProfileId=${targetChildId}`, {
              signal: charactersController.signal
            })
            clearTimeout(charactersTimeoutId)
            
            console.log('📡 Characters response:', charactersResponse.status)
            
            if (charactersResponse.ok) {
              const characters = await charactersResponse.json()
              console.log('✅ Characters loaded:', characters)
              setAvailableCharacters(characters)
            } else {
              console.error('❌ Failed to fetch characters:', charactersResponse.status)
            }
          } else {
            console.log('⚠️ No child profiles found')
          }
        } else {
          console.error('❌ Failed to fetch child profiles:', response.status)
          setErrors(['Failed to load child profiles'])
        }
      } catch (error) {
        console.error('💥 Error loading child profiles:', error)
        
        if (error instanceof Error && error.name === 'AbortError') {
          setErrors(['Request timed out. Please check your connection and try again.'])
        } else {
          setErrors(['Failed to load child profiles: ' + (error instanceof Error ? error.message : 'Unknown error')])
        }
      } finally {
        console.log('✅ Loading complete, setting isLoading to false')
        setIsLoading(false)
      }
    }

    // Add additional safety checks
    if (session?.user?.id) {
      console.log('👤 User authenticated, loading data...')
      loadChildProfiles()
    } else if (session === null) {
      console.log('❌ No session found, redirecting to login...')
      setIsLoading(false)
      router.push('/auth/signin')
    } else {
      console.log('⏳ Waiting for authentication...')
      // Set a timeout to prevent infinite loading
      setTimeout(() => {
        if (!session?.user?.id) {
          console.log('⏰ Authentication timeout, redirecting...')
          setIsLoading(false)
          router.push('/auth/signin')
        }
      }, 5000)
    }
  }, [session, preSelectedChildId, router])

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
    console.log('Character toggle clicked:', characterId)
    setSelectedCharacters(prev => {
      const newSelection = prev.includes(characterId) 
        ? prev.filter(id => id !== characterId)
        : [...prev, characterId].slice(0, 3) // Max 3 characters
      console.log('New character selection:', newSelection)
      return newSelection
    })
  }

  const handleCreateStory = async () => {
    // Clear previous errors
    setErrors([])
    
    // Validation
    if (!selectedChild) {
      setErrors(['Please select a child profile'])
      return
    }
    
    if (!selectedTheme) {
      setErrors(['Please select a story theme'])
      return
    }
    
    if (selectedCharacters.length === 0) {
      setErrors(['Please select at least one character'])
      return
    }

    console.log('Creating story with:', {
      selectedChild,
      selectedTheme,
      selectedCharacters,
      customPrompt,
      moralLesson
    })

    // Check subscription limits - temporarily disabled
    // if (subscription && !subscriptionLoading) {
    //   const { usage } = subscription
      
    //   // Check if user has reached story limit
    //   if (usage.storiesLimit !== -1 && usage.storiesThisMonth >= usage.storiesLimit && usage.credits === 0) {
    //     setErrors([
    //       `You've reached your monthly limit of ${usage.storiesLimit} stories. `,
    //       'Upgrade your plan or purchase credits to continue creating stories.'
    //     ])
    //     return
    //   }

    //   // Warn if close to limit
    //   if (usage.storiesLimit !== -1 && usage.storiesThisMonth >= usage.storiesLimit - 1 && usage.credits === 0) {
    //     setErrors([
    //       'This will be your last story this month. Consider upgrading your plan for unlimited stories.'
    //     ])
    //   }
    // }
    
    setIsGenerating(true)
    setErrors([])
    
    try {
      console.log('Creating story with:', { theme: selectedTheme, characterIds: selectedCharacters, childProfileId: selectedChild })
      
      const response = await fetch('/api/stories/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme: selectedTheme,
          characterIds: selectedCharacters,
          childProfileId: selectedChild,
          storyDetails: customPrompt || undefined,
          moralLesson: moralLesson || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create story')
      }

      const data = await response.json()
      console.log('Story created successfully:', data)
      
      if (!data.story?.id) {
        throw new Error('Invalid response: missing story ID')
      }
      
      // Navigate to the new story
      router.push(`/stories/${data.story.id}`)
    } catch (error) {
      console.error('Error creating story:', error)
      setErrors([error instanceof Error ? error.message : 'Failed to create story'])
    } finally {
      // Always reset generating state
      setIsGenerating(false)
    }
  }

  if (isLoading && !loadingTimeout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-200 via-purple-100 to-pink-200 relative overflow-hidden">
        {/* Floating decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 text-4xl animate-float opacity-20">📚</div>
          <div className="absolute top-32 right-20 text-3xl animate-bounce-slow opacity-30">⭐</div>
          <div className="absolute bottom-40 left-16 text-4xl animate-float opacity-25">🎨</div>
          <div className="absolute bottom-32 right-24 text-3xl animate-bounce-slow opacity-20">✨</div>
        </div>
        
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 mx-auto animate-bounce-gentle shadow-lg">
                <span className="text-white text-3xl">📚</span>
              </div>
              <p className="text-purple-700 font-medium text-lg">✨ Preparing your story creation workshop ✨</p>
              <Button 
                onClick={() => {
                  console.log('🔄 Manual retry triggered')
                  setIsLoading(false)
                  setLoadingTimeout(false)
                }} 
                className="mt-4"
                variant="outline"
              >
                Taking too long? Click to continue anyway
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Show error state if loading timed out
  if (loadingTimeout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-200 via-purple-100 to-pink-200 relative overflow-hidden">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                <span className="text-white text-3xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-bold text-red-700 mb-2">Loading Timeout</h2>
              <p className="text-red-600 mb-4">The page took too long to load. This might be because:</p>
              <ul className="text-red-600 text-left max-w-md mx-auto mb-6 space-y-1">
                <li>• The server isn&apos;t running</li>
                <li>• You need to sign in first</li>
                <li>• No sample data exists</li>
              </ul>
              <div className="space-x-4">
                <Button 
                  onClick={() => router.push('/auth/signin')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  🔐 Sign In
                </Button>
                <Button 
                  onClick={() => {
                    setLoadingTimeout(false)
                    setIsLoading(true)
                    window.location.reload()
                  }}
                  variant="outline"
                >
                  🔄 Retry
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-gradient-to-br from-sky-200 via-purple-100 to-pink-200 relative overflow-hidden">
        {/* Floating decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 text-4xl animate-float opacity-20">📚</div>
          <div className="absolute top-32 right-20 text-3xl animate-bounce-slow opacity-30">⭐</div>
          <div className="absolute top-60 left-1/4 text-5xl animate-float-delayed opacity-15">🌈</div>
          <div className="absolute bottom-40 left-16 text-4xl animate-float opacity-25">🎨</div>
          <div className="absolute bottom-32 right-24 text-3xl animate-bounce-slow opacity-20">✨</div>
          <div className="absolute top-80 right-1/3 text-2xl animate-bounce-gentle opacity-25">🦋</div>
        </div>
        
        <Header />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 relative">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent mb-2 animate-text-glow">
              📚 Create a Magical Story ✨
            </h1>
            <p className="text-purple-700 font-medium text-lg">🌟 Tell us about your story and we&apos;ll create an amazing adventure! 🌈</p>
            
            {/* Debug Info - Remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-gray-100 rounded-lg text-sm">
                <strong>Debug Info:</strong> Child Profiles: {childProfiles.length}, Characters: {availableCharacters.length}, Selected Child: {selectedChild}, Selected Theme: {selectedTheme}
                {childProfiles.length === 0 && (
                  <div className="text-red-600 mt-2">
                    ⚠️ No child profiles found. <a href="/dashboard" className="underline">Create one first</a>
                  </div>
                )}
                {availableCharacters.length === 0 && selectedChild && (
                  <div className="text-red-600 mt-2">
                    ⚠️ No characters found for selected child. <a href="/characters/create" className="underline">Create characters first</a>
                  </div>
                )}
              </div>
            )}
          </div>

          {errors.length > 0 && (
            <Card className="mb-6 p-4 border-red-200 bg-red-50">
              <CardContent className="p-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-500">⚠️</span>
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

          <Card variant="glass" className="p-8 hover:shadow-xl transition-all duration-300">
            <CardContent className="space-y-6 p-0">
              {/* Child Profile Selection */}
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  Select Child Profile
                </label>
                {childProfiles.length === 0 ? (
                  <Card className="p-6 text-center border-dashed border-2 border-gray-300">
                    <CardContent className="p-0">
                      <p className="text-gray-600 mb-4">No child profiles found. Create one first!</p>
                      <Button onClick={() => router.push('/dashboard')} variant="gradient">
                        Go to Dashboard
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {childProfiles.map((profile) => (
                      <Card 
                        key={profile.id}
                        hover 
                        className={`p-4 cursor-pointer transition-all duration-300 hover:scale-105 ${
                          selectedChild === profile.id ? 'border-2 border-orange-500 bg-orange-50 ring-2 ring-orange-200' : ''
                        }`}
                        onClick={() => {
                          console.log('Child profile clicked:', profile.id)
                          setSelectedChild(profile.id)
                        }}
                        data-testid={`child-profile-${profile.id}`}
                      >
                        <CardContent className="text-center p-0">                        <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center mb-2 mx-auto">
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
              <div>
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
                  ].map((themeOption) => (
                    <Button
                      key={themeOption.theme}
                      variant={selectedTheme === themeOption.theme ? 'gradient' : 'outline'}
                      className={`h-20 flex flex-col gap-2 transition-all duration-300 hover:scale-110 ${
                        selectedTheme === themeOption.theme ? 'ring-2 ring-orange-300' : ''
                      }`}
                      onClick={() => {
                        console.log('Theme selected:', themeOption.theme)
                        setSelectedTheme(themeOption.theme as StoryTheme)
                      }}
                      data-theme={themeOption.theme}
                      data-testid={`theme-${themeOption.theme}`}
                    >
                      <span className="text-2xl">{themeOption.emoji}</span>
                      <span className="text-sm">{themeOption.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Characters */}
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  Choose Characters (max 3)
                </label>
                {availableCharacters.length === 0 ? (
                  <Card className="p-6 text-center border-dashed border-2 border-gray-300">
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
                    {availableCharacters.map((character) => (
                      <div 
                        key={character.id}
                        className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                          selectedCharacters.includes(character.id)
                            ? 'border-2 border-orange-300 bg-orange-50 shadow-md'
                            : 'border hover:border-orange-300 hover:bg-orange-50 hover:shadow-sm'
                        }`}
                        onClick={() => toggleCharacter(character.id)}
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xl">
                            {character.species === 'animal' ? '🐾' : 
                             character.species === 'magical' ? '✨' : '👤'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{character.name}</h4>
                          <p className="text-sm text-gray-600">{character.personalityDescription}</p>
                          <div className="flex gap-1 mt-1">
                            {(character.personalityTraits || []).slice(0, 3).map((trait) => (
                              <span 
                                key={trait} 
                                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                              >
                                {trait}
                              </span>
                            ))}
                          </div>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={selectedCharacters.includes(character.id)}
                          onChange={() => toggleCharacter(character.id)}
                          className="w-5 h-5 text-orange-500 transition-transform duration-200 hover:scale-110"
                        />
                      </div>
                    ))}
                    
                    <Button 
                      variant="outline" 
                      className="w-full hover:scale-[1.02] transition-all duration-200"
                      onClick={() => router.push('/characters/create')}
                    >
                      ✨ Create New Character
                    </Button>
                  </div>
                )}
              </div>

              {/* Story Details */}
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  Story Details (Optional)
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => {
                    console.log('Custom prompt changed:', e.target.value)
                    setCustomPrompt(e.target.value)
                  }}
                  placeholder="Tell us more about what should happen in the story... (e.g., 'The character should learn about friendship and face a small challenge in the magical forest')"
                  className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 hover:border-orange-300"
                  data-testid="custom-prompt"
                />
              </div>

              {/* Moral/Lesson */}
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  Lesson or Moral (Optional)
                </label>
                <select 
                  value={moralLesson}
                  onChange={(e) => {
                    console.log('Moral lesson changed:', e.target.value)
                    setMoralLesson(e.target.value)
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 hover:border-orange-300"
                  data-testid="moral-lesson"
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

              <div className="flex gap-4 pt-6">
                <Button 
                  variant="outline" 
                  className="flex-1 hover:scale-105 transition-all duration-200"
                  onClick={() => router.push('/dashboard')}
                  disabled={isGenerating}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1" 
                  size="lg"
                  onClick={handleCreateStory}
                  disabled={isGenerating}
                  isLoading={isGenerating}
                  variant="magical"
                >
                  {isGenerating ? '🪄 Creating Magic...' : '✨ Create Story'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </AnimatedPage>
  )
}
