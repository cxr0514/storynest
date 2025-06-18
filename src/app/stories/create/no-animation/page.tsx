'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading'
import { ChildProfile, Character, StoryTheme } from '@/types'

export default function CreateStoryNoAnimation() {
  const router = useRouter()
  const { data: session } = useSession()
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([])
  const [availableCharacters, setAvailableCharacters] = useState<Character[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Form state
  const [selectedChild, setSelectedChild] = useState<string>('')
  const [selectedTheme, setSelectedTheme] = useState<StoryTheme | ''>('')
  const [errors, setErrors] = useState<string[]>([])

  console.log('🔍 Form state:', { 
    isLoading, 
    childProfiles: childProfiles.length, 
    session: !!session,
    selectedChild,
    selectedTheme
  })

  // Redirect if not authenticated
  useEffect(() => {
    console.log('🔍 Auth status:', { session, loading: !session })
    if (!session && typeof window !== 'undefined') {
      console.log('🚫 Not authenticated, redirecting...')
      router.push('/auth/signin')
      return
    }
  }, [session, router])

  useEffect(() => {
    console.log('🔄 Starting loadChildProfiles...')
    const loadChildProfiles = async () => {
      try {
        console.log('📡 Fetching child profiles...')
        const response = await fetch('/api/child-profiles')
        console.log('📡 Child profiles response:', response.status)
        
        if (response.ok) {
          const profiles = await response.json()
          console.log('✅ Child profiles loaded:', profiles)
          setChildProfiles(profiles)
          
          if (profiles.length > 0) {
            console.log('🎯 Setting selected child to:', profiles[0].id)
            setSelectedChild(profiles[0].id)
            
            // Load characters for the first child
            console.log('📡 Fetching characters for child:', profiles[0].id)
            const charactersResponse = await fetch(`/api/characters?childProfileId=${profiles[0].id}`)
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
        setErrors(['Failed to load child profiles: ' + (error instanceof Error ? error.message : 'Unknown error')])
      } finally {
        console.log('✅ Loading complete, setting isLoading to false')
        setIsLoading(false)
      }
    }

    if (session) {
      console.log('👤 User authenticated, loading data...')
      loadChildProfiles()
    } else {
      console.log('⏳ Waiting for authentication...')
    }
  }, [session])

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent mb-2">
            Create a Magical Story (No Animation)
          </h1>
          <p className="text-gray-600">Tell us about your story and we&apos;ll create a magical adventure</p>
          
          {/* Debug Info */}
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

        <Card className="p-8">
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
                    <Button onClick={() => router.push('/dashboard')}>
                      Go to Dashboard
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {childProfiles.map((profile) => (
                    <Card 
                      key={profile.id}
                      className={`p-4 cursor-pointer transition-all duration-300 ${
                        selectedChild === profile.id ? 'border-2 border-orange-500 bg-orange-50' : ''
                      }`}
                      onClick={() => {
                        console.log('Child profile clicked:', profile.id)
                        setSelectedChild(profile.id)
                      }}
                    >
                      <CardContent className="text-center p-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center mb-2 mx-auto">
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
                    variant={selectedTheme === themeOption.theme ? 'primary' : 'outline'}
                    className={`h-20 flex flex-col gap-2 ${
                      selectedTheme === themeOption.theme ? 'ring-2 ring-orange-300' : ''
                    }`}
                    onClick={() => {
                      console.log('Theme selected:', themeOption.theme)
                      setSelectedTheme(themeOption.theme as StoryTheme)
                    }}
                  >
                    <span className="text-2xl">{themeOption.emoji}</span>
                    <span className="text-sm">{themeOption.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => router.push('/dashboard')}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1" 
                size="lg"
                onClick={() => {
                  console.log('Create story clicked with:', { selectedChild, selectedTheme })
                  alert(`Would create story for ${selectedChild} with theme ${selectedTheme}`)
                }}
                disabled={!selectedChild || !selectedTheme}
              >
                ✨ Create Story
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
