'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AnimatedPage } from '@/components/ui/animated-page'
import { Badge } from '@/components/ui/badge'
import { ChildProfile, Character, StoryTheme } from '@/types'

interface PageCountOption {
  value: number
  label: string
  description: string
  duration: string
  icon: string
}

export default function CreateStory() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preSelectedChildId = searchParams.get('childId')
  const { data: session, status } = useSession()
  
  // State management
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([])
  const [availableCharacters, setAvailableCharacters] = useState<Character[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState('')
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(null)
  
  // Form state
  const [selectedChild, setSelectedChild] = useState<string>('')
  const [selectedTheme, setSelectedTheme] = useState<StoryTheme | ''>('')
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([])
  const [selectedPageCount, setSelectedPageCount] = useState<number>(5)
  const [storyDescription, setStoryDescription] = useState('')
  const [moralLesson, setMoralLesson] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  // Page count options
  const pageCountOptions: PageCountOption[] = [
    { value: 3, label: '3 Pages', description: 'Quick story', duration: '3-5 min read', icon: '⚡' },
    { value: 5, label: '5 Pages', description: 'Perfect balance', duration: '5-8 min read', icon: '🌟' },
    { value: 8, label: '8 Pages', description: 'Rich adventure', duration: '8-12 min read', icon: '📖' },
    { value: 10, label: '10 Pages', description: 'Epic tale', duration: '12-15 min read', icon: '🚀' },
    { value: 12, label: '12 Pages', description: 'Long journey', duration: '15-20 min read', icon: '🌙' },
    { value: 15, label: '15 Pages', description: 'Grand adventure', duration: '20-25 min read', icon: '✨' }
  ]

  // Handle authentication status changes
  useEffect(() => {
    console.log('🔍 Auth status changed:', { status, session: !!session })
    
    if (status === 'loading') {
      console.log('⏳ Authentication loading...')
      return
    }
    
    if (status === 'unauthenticated' || !session) {
      console.log('🚫 Not authenticated, redirecting to sign-in...')
      router.push('/auth/signin')
      return
    }
    
    if (status === 'authenticated' && session) {
      console.log('✅ Authenticated, loading data...')
      // User is authenticated, data loading will be handled by the next useEffect
    }
  }, [status, session, router])

  // Load child profiles and characters
  useEffect(() => {
    const loadData = async () => {
      if (!session?.user?.id) {
        console.log('❌ No user session, skipping data load')
        return
      }

      try {
        setIsLoading(true)
        console.log('📡 Loading child profiles...')
        
        const profilesResponse = await fetch('/api/child-profiles')
        if (!profilesResponse.ok) {
          throw new Error('Failed to fetch child profiles')
        }
        
        const profiles = await profilesResponse.json()
        console.log('✅ Child profiles loaded:', profiles.length)
        setChildProfiles(profiles)
        
        if (profiles.length > 0) {
          // Select the first profile or pre-selected one
          const targetChildId = preSelectedChildId && profiles.find((p: ChildProfile) => p.id === preSelectedChildId) 
            ? preSelectedChildId 
            : profiles[0].id
            
          console.log('🎯 Setting selected child to:', targetChildId)
          setSelectedChild(targetChildId)
          
          // Load characters for the selected child
          console.log('📡 Loading characters...')
          const charactersResponse = await fetch(`/api/characters?childProfileId=${targetChildId}`)
          if (charactersResponse.ok) {
            const characters = await charactersResponse.json()
            console.log('✅ Characters loaded:', characters.length)
            setAvailableCharacters(characters)
          }
        }
      } catch (error) {
        console.error('💥 Error loading data:', error)
        setErrors(['Failed to load data. Please try refreshing the page.'])
      } finally {
        setIsLoading(false)
        console.log('✅ Data loading complete')
      }
    }

    if (status === 'authenticated' && session?.user?.id) {
      loadData()
    }
  }, [session, preSelectedChildId, status])

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
    }        console.log('Creating story with:', {
          selectedChild,
          selectedTheme,
          selectedCharacters,
          storyDescription,
          moralLesson,
          selectedPageCount
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
    setGenerationProgress('Preparing your story...')
    setGenerationStartTime(Date.now())
    
    let progressInterval: NodeJS.Timeout | null = null
    
    try {
      console.log('Creating story with:', { theme: selectedTheme, characterIds: selectedCharacters, childProfileId: selectedChild })
      
      // Update progress periodically
      progressInterval = setInterval(() => {
        const elapsed = Date.now() - (generationStartTime || Date.now())
        const seconds = Math.floor(elapsed / 1000)
        
        if (seconds < 10) {
          setGenerationProgress('🤖 AI is crafting your story...')
        } else if (seconds < 30) {
          setGenerationProgress('📝 Writing an amazing adventure...')
        } else if (seconds < 50) {
          setGenerationProgress('🎨 Adding magical details...')
        } else {
          setGenerationProgress('⏰ Almost ready... (this might take up to 70 seconds)')
        }
      }, 3000)
      
      // Add timeout protection for story generation request
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
        console.log('🚨 Story generation request timed out after 70 seconds')
      }, 70000) // 70 seconds (10 seconds more than server timeout)
      
      const response = await fetch('/api/stories/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          theme: selectedTheme,
          characterIds: selectedCharacters,
          childProfileId: selectedChild,
          storyDetails: storyDescription || undefined,
          moralLesson: moralLesson || undefined,
          pageCount: selectedPageCount
        }),
      })
      
      clearTimeout(timeoutId)
      if (progressInterval) {
        clearInterval(progressInterval)
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create story')
      }

      const data = await response.json()
      console.log('Story created successfully:', data)
      
      if (!data.story?.id) {
        throw new Error('Invalid response: missing story ID')
      }
      
      setGenerationProgress('✨ Story created! Redirecting...')
      
      // Navigate to the new story
      router.push(`/stories/${data.story.id}`)
    } catch (error) {
      console.error('Error creating story:', error)
      
      if (progressInterval) {
        clearInterval(progressInterval)
      }
      
      if (error instanceof Error && error.name === 'AbortError') {
        setErrors([
          'Story generation timed out after 70 seconds. This may be due to high server load.',
          'Please try again with a shorter story prompt or wait a few minutes.'
        ])
      } else {
        setErrors([error instanceof Error ? error.message : 'Failed to create story'])
      }
    } finally {
      // Always reset generating state
      setIsGenerating(false)
      setGenerationProgress('')
      if (progressInterval) {
        clearInterval(progressInterval)
      }
    }
  }

  if (isLoading) {
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
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent mb-4 animate-text-glow">
              ✨ Create Your Magical Story ✨
            </h1>
            <p className="text-xl text-purple-700 font-medium mb-2">
              🌟 Bring your imagination to life with AI-powered storytelling! 🌈
            </p>
            <p className="text-lg text-gray-600">
              Choose your characters, pick a theme, and let&apos;s create an amazing adventure together!
            </p>
            
            {/* Quick Stats */}
            <div className="mt-6 flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full">
                <span className="text-purple-600">📚</span>
                <span className="text-purple-700 font-medium">Pixar-Style Illustrations</span>
              </div>
              <div className="flex items-center gap-2 bg-pink-100 px-4 py-2 rounded-full">
                <span className="text-pink-600">🎨</span>
                <span className="text-pink-700 font-medium">Custom Characters</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full">
                <span className="text-blue-600">⚡</span>
                <span className="text-blue-700 font-medium">AI-Powered</span>
              </div>
            </div>
            
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

              {/* Page Count Selection */}
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  📖 Story Length
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {pageCountOptions.map((option) => (
                    <Card
                      key={option.value}
                      className={`p-4 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-md ${
                        selectedPageCount === option.value 
                          ? 'border-2 border-purple-500 bg-purple-50 ring-2 ring-purple-200' 
                          : 'border hover:border-purple-300'
                      }`}
                      onClick={() => {
                        console.log('Page count selected:', option.value)
                        setSelectedPageCount(option.value)
                      }}
                    >
                      <CardContent className="text-center p-0">
                        <div className="text-3xl mb-2">{option.icon}</div>
                        <div className="font-semibold text-gray-800">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.description}</div>
                        <Badge 
                          variant={selectedPageCount === option.value ? "default" : "secondary"}
                          className="mt-2 text-xs"
                        >
                          {option.duration}
                        </Badge>
                      </CardContent>
                    </Card>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableCharacters.map((character) => (
                      <Card
                        key={character.id}
                        className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg relative overflow-hidden ${
                          selectedCharacters.includes(character.id)
                            ? 'border-2 border-orange-400 bg-orange-50 shadow-xl ring-2 ring-orange-200'
                            : 'border hover:border-orange-300 hover:shadow-md'
                        }`}
                        onClick={() => toggleCharacter(character.id)}
                      >
                        <CardContent className="p-4">
                          {/* Character Avatar */}
                          <div className="relative mb-3">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 via-pink-500 to-blue-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                              <span className="text-white text-2xl">
                                {character.species === 'animal' ? '🐾' : 
                                 character.species === 'magical' ? '✨' : 
                                 character.species === 'human' ? '👤' : '🌟'}
                              </span>
                            </div>
                            {/* Selection Indicator */}
                            {selectedCharacters.includes(character.id) && (
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                <span className="text-white text-sm">✓</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Character Info */}
                          <div className="text-center">
                            <h4 className="font-bold text-gray-800 mb-1">{character.name}</h4>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {character.personalityDescription}
                            </p>
                            
                            {/* Character Traits */}
                            <div className="flex flex-wrap gap-1 justify-center mb-3">
                              {(character.personalityTraits || []).slice(0, 2).map((trait) => (
                                <Badge 
                                  key={trait} 
                                  variant="secondary" 
                                  className="text-xs px-2 py-1"
                                >
                                  {trait}
                                </Badge>
                              ))}
                            </div>
                            
                            {/* Character Species Badge */}
                            <Badge 
                              variant={selectedCharacters.includes(character.id) ? "default" : "outline"}
                              className="text-xs capitalize"
                            >
                              {character.species || 'character'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {/* Add New Character Card */}
                    <Card className="border-2 border-dashed border-gray-300 hover:border-purple-400 transition-all duration-300 hover:shadow-md cursor-pointer">
                      <CardContent className="p-4 h-full flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <span className="text-white text-2xl">➕</span>
                        </div>
                        <h4 className="font-bold text-gray-600 mb-2">Create New Character</h4>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push('/characters/create')
                          }}
                          className="hover:scale-105 transition-transform duration-200"
                        >
                          ✨ Add Character
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>

              {/* Story Description & Hints */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-lg font-semibold text-gray-800">
                    💭 Story Hints & Ideas <span className="text-sm font-normal text-gray-500">(Optional)</span>
                  </label>
                  <span className="text-sm text-gray-500">
                    {storyDescription.length}/500
                  </span>
                </div>
                <textarea
                  value={storyDescription}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      console.log('Story description changed:', e.target.value)
                      setStoryDescription(e.target.value)
                    }
                  }}
                  placeholder="Share your ideas for the story... What adventure should happen? What should the characters learn? Any specific settings or magical elements? (e.g., 'The characters should explore an enchanted forest and learn about friendship while helping a lost fairy find her way home.')"
                  className="w-full h-28 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300"
                  data-testid="story-description"
                  maxLength={500}
                />
                <div className="mt-2 text-xs text-gray-500">
                  💡 <strong>Tip:</strong> The more details you provide, the more personalized your story will be!
                </div>
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

              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                <Button 
                  variant="outline" 
                  className="flex-1 hover:scale-105 transition-all duration-200 h-12"
                  onClick={() => router.push('/dashboard')}
                  disabled={isGenerating}
                  aria-label="Cancel story creation and return to dashboard"
                >
                  <span className="mr-2">❌</span>
                  Cancel
                </Button>
                <Button 
                  className="flex-1 h-12 text-lg font-bold shadow-lg hover:shadow-xl" 
                  size="lg"
                  onClick={handleCreateStory}
                  disabled={isGenerating || !selectedChild || !selectedTheme || selectedCharacters.length === 0}
                  isLoading={isGenerating}
                  variant="magical"
                  aria-label={isGenerating ? 'Creating your magical story' : 'Create your magical story'}
                >
                  {isGenerating ? (
                    <>
                      <span className="mr-2">🪄</span>
                      Creating Magic...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">✨</span>
                      Create My Story ({selectedPageCount} pages)
                    </>
                  )}
                </Button>
              </div>

              {/* Form Validation Summary */}
              {(!selectedChild || !selectedTheme || selectedCharacters.length === 0) && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <span>⚠️</span>
                    <span className="font-medium">Complete these steps to create your story:</span>
                  </div>
                  <ul className="mt-2 text-sm text-yellow-700 ml-6 space-y-1">
                    {!selectedChild && <li>• Select a child profile</li>}
                    {!selectedTheme && <li>• Choose a story theme</li>}
                    {selectedCharacters.length === 0 && <li>• Pick at least one character</li>}
                  </ul>
                </div>
              )}

              {/* Progress Indicator */}
              {isGenerating && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="text-blue-800 font-medium">{generationProgress}</span>
                  </div>
                  <div className="mt-2">
                    <div className="bg-blue-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      Story generation typically takes 15-60 seconds. Please don&apos;t close this page.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </AnimatedPage>
  )
}
