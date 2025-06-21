/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { AnimatedPage } from '@/components/ui/animated-page'
import type { ChildProfile, Character } from '@/types'

/* ── selector constants ───────────────────────────────────── */
export const LANGUAGE_OPTIONS = [
  'English','Spanish','French','German','Italian','Portuguese',
  'Dutch','Swedish','Japanese','Chinese',
] as const

export const STORY_TYPE_OPTIONS = [
  'Bedtime Story: A classic.','Fable: Moral lessons, talking animals.',
  'Fairytale: Magic, enchanting creatures, happy endings.',
  'Adventure: Exciting journeys, young heroes, challenges.',
  'Educational: Informative, age-appropriate facts, engaging.',
  'Mystery: Puzzles, clues, child detectives.',
  'Science fiction: Futuristic, imaginative worlds, exploration.',
  'Realistic fiction: Everyday life, relatable characters, emotions.',
] as const

export const WRITING_STYLE_OPTIONS = [
  'Imaginative: Creative, whimsical, fantastical elements.',
  'Funny: Humorous, witty, light-hearted tone.',
  'Heartwarming: Uplifting, positive messages, emotional connections.',
  'Action-packed: Fast-paced, thrilling, adventure-filled.',
  'Nostalgic: Familiar settings, relatable experiences, memories.',
  'Empowering: Confidence-building, inspiring, strong characters.',
  'Spooky: Mild scares, eerie settings, suspenseful.',
  'Educational: Informative, engaging, age-appropriate lessons.',
] as const

export const READER_AGE_OPTIONS = [
  '3 – 5 years','5 – 7 years','7 – 9 years','8 – 10 years','10 – 12 years',
] as const

export const PAGE_COUNT_OPTIONS = [6, 8, 10, 12] as const

export const STORY_THEME_OPTIONS = [
  'Adventure','Friendship','Courage','Kindness','Mystery',
  'Space Exploration','Underwater World',
] as const

/* ── main component ───────────────────────────────────────── */
export default function CreateStoryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preSelectedChildId = searchParams.get('childId')
  const { data: session, status } = useSession()

  /* fetch state */
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([])
  const [availableCharacters, setAvailableCharacters] = useState<Character[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  /* form state */
  const [selectedChild, setSelectedChild] = useState<string>('')
  const [selectedTheme, setSelectedTheme] = useState<string>('')
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  /* AI child profile creation state */
  const [showCreateProfile, setShowCreateProfile] = useState(false)
  const [isCreatingProfile, setIsCreatingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: '',
    age: '',
    visualDescription: '',
    interests: ''
  })

  /* authentication check */
  const loadData = useCallback(async () => {
    try {
      // Load child profiles
      const profilesResponse = await fetch('/api/child-profiles')
      if (profilesResponse.ok) {
        const profiles = await profilesResponse.json()
        setChildProfiles(profiles)
        if (profiles.length > 0) {
          const initialChild = preSelectedChildId || profiles[0].id
          setSelectedChild(initialChild)
        }
      } else {
        console.error('Failed to load profiles, status:', profilesResponse.status)
      }

      // Load characters
      const charactersResponse = await fetch('/api/characters')
      if (charactersResponse.ok) {
        const characters = await charactersResponse.json()
        setAvailableCharacters(characters)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setError('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }, [preSelectedChildId])

  useEffect(() => {
    if (status === 'loading') return // Still loading
    
    if (status === 'unauthenticated') {
      console.log('🚫 Not authenticated, redirecting...')
      router.push('/auth/signin')
      return
    }
    
    if (status === 'authenticated' && session) {
      console.log('👤 User authenticated, loading data...')
      loadData()
    }
  }, [status, session, router, preSelectedChildId, loadData])

  const handleCreateChildProfile = async () => {
    if (!profileForm.name || !profileForm.age || !profileForm.visualDescription) {
      setError('Please fill in all required fields for the child profile')
      return
    }

    setIsCreatingProfile(true)
    setError(null)

    try {
      const response = await fetch('/api/child-profiles/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profileForm.name,
          age: profileForm.age,
          visualDescription: profileForm.visualDescription,
          interests: profileForm.interests,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        
        // Reload child profiles to include the new one
        await loadData()
        
        // Select the newly created profile
        setSelectedChild(result.id)
        
        // Reset form and hide modal
        setProfileForm({ name: '', age: '', visualDescription: '', interests: '' })
        setShowCreateProfile(false)
        
        console.log('✅ Child profile created successfully:', result.id)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create child profile')
      }
    } catch (error) {
      console.error('Error creating child profile:', error)
      setError('Failed to create child profile')
    } finally {
      setIsCreatingProfile(false)
    }
  }

  const handleGenerateStory = async () => {
    if (!selectedChild || !selectedTheme) {
      setError('Please select a child profile and theme')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/stories/generate-enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childProfileId: selectedChild,
          theme: selectedTheme,
          characterIds: selectedCharacters,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/stories/${result.storyId}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to generate story')
      }
    } catch (error) {
      console.error('Error generating story:', error)
      setError('Failed to generate story')
    } finally {
      setIsGenerating(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <AnimatedPage>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Create New Story</h1>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <p className="text-center text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </AnimatedPage>
    )
  }

  return (
    <AnimatedPage>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Create New Story</h1>
          
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Story Creation Workshop</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                {/* Child Profile Selection with Create Option */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Select Child Profile
                    </label>
                    <Button
                      onClick={() => setShowCreateProfile(true)}
                      variant="outline"
                      size="sm"
                      className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
                    >
                      + Create AI Profile
                    </Button>
                  </div>
                  
                  {childProfiles.length === 0 ? (
                    <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <span className="text-white text-2xl">👶</span>
                      </div>
                      <p className="text-gray-600 mb-4">No child profiles found. Create one with AI-generated avatar!</p>
                      <Button
                        onClick={() => setShowCreateProfile(true)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      >
                        Create First Profile with AI
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {childProfiles.map((profile) => (
                        <Card
                          key={profile.id}
                          className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                            selectedChild === profile.id
                              ? 'border-2 border-blue-500 bg-blue-50'
                              : 'border border-gray-200'
                          }`}
                          onClick={() => setSelectedChild(profile.id)}
                        >
                          <CardContent className="text-center p-0">
                            {profile.avatarUrl ? (
                              <div className="relative">
                                <img
                                  src={profile.avatarUrl}
                                  alt={`${profile.name}'s avatar`}
                                  className="w-16 h-16 rounded-full mx-auto mb-2 object-cover"
                                  onError={(e) => {
                                    console.error(`Avatar failed to load for ${profile.name}:`, profile.avatarUrl)
                                    // Hide the broken image and show fallback
                                    e.currentTarget.style.display = 'none'
                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement
                                    if (fallback) fallback.classList.remove('hidden')
                                  }}
                                  onLoad={() => {
                                    console.log(`Avatar loaded successfully for ${profile.name}`)
                                  }}
                                />
                                {/* Always render fallback, hide/show based on image load */}
                                <div className={`w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center mb-2 mx-auto ${profile.avatarUrl ? 'hidden' : ''}`}>
                                  <span className="text-white font-bold text-lg">{profile.name[0]}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center mb-2 mx-auto">
                                <span className="text-white font-bold text-lg">{profile.name[0]}</span>
                              </div>
                            )}
                            <p className="font-medium text-sm">{profile.name} ({profile.age})</p>
                            <p className="text-xs text-gray-600">
                              {(profile.interests || []).slice(0, 2).join(', ')}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Story Theme Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Story Theme
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {STORY_THEME_OPTIONS.map((theme) => (
                      <Button
                        key={theme}
                        variant={selectedTheme === theme ? "primary" : "outline"}
                        className={`p-3 text-sm ${
                          selectedTheme === theme
                            ? 'bg-purple-600 text-white'
                            : 'border-gray-300 hover:border-purple-400'
                        }`}
                        onClick={() => setSelectedTheme(theme)}
                      >
                        {theme}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Character Selection */}
                {availableCharacters.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Characters (Optional)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {availableCharacters.map((character) => (
                        <label key={character.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCharacters.includes(character.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCharacters([...selectedCharacters, character.id])
                              } else {
                                setSelectedCharacters(selectedCharacters.filter(id => id !== character.id))
                              }
                            }}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium">{character.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Generate Button */}
                <div className="pt-6">
                  <Button
                    onClick={handleGenerateStory}
                    disabled={isGenerating || !selectedChild || !selectedTheme}
                    className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isGenerating ? 'Generating Story...' : 'Generate Story'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Child Profile Creation Modal */}
      {showCreateProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Create AI Child Profile</h2>
              <button
                onClick={() => setShowCreateProfile(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
                disabled={isCreatingProfile}
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter child's name"
                  disabled={isCreatingProfile}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age *
                </label>
                <input
                  type="number"
                  min="1"
                  max="18"
                  value={profileForm.age}
                  onChange={(e) => setProfileForm({...profileForm, age: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter child's age"
                  disabled={isCreatingProfile}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visual Description * 
                  <span className="text-xs text-gray-500">(for AI avatar generation)</span>
                </label>
                <textarea
                  value={profileForm.visualDescription}
                  onChange={(e) => setProfileForm({...profileForm, visualDescription: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                  placeholder="Describe the child's appearance (e.g., 'blonde hair, blue eyes, cheerful smile')"
                  disabled={isCreatingProfile}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interests
                  <span className="text-xs text-gray-500">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={profileForm.interests}
                  onChange={(e) => setProfileForm({...profileForm, interests: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., dinosaurs, art, music, sports"
                  disabled={isCreatingProfile}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowCreateProfile(false)}
                variant="outline"
                className="flex-1"
                disabled={isCreatingProfile}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateChildProfile}
                disabled={isCreatingProfile || !profileForm.name || !profileForm.age || !profileForm.visualDescription}
                className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
              >
                {isCreatingProfile ? 'Creating with AI...' : 'Create Profile'}
              </Button>
            </div>

            {isCreatingProfile && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  🎨 Generating AI avatar with DALL-E and uploading to secure storage...
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </AnimatedPage>
  )
}
