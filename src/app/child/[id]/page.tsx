'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading'
import { ChildProfile, Story, Character } from '@/types'

export default function ChildProfilePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const childId = params.id as string

  const [childProfile, setChildProfile] = useState<ChildProfile | null>(null)
  const [stories, setStories] = useState<Story[]>([])
  const [characters, setCharacters] = useState<Character[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    const loadChildData = async () => {
      try {
        // Load child profile
        const profileResponse = await fetch('/api/child-profiles')
        if (profileResponse.ok) {
          const profiles = await profileResponse.json()
          const profile = profiles.find((p: ChildProfile) => p.id === childId)
          
          if (!profile) {
            router.push('/dashboard')
            return
          }
          
          setChildProfile(profile)
        }

        // Load child's stories
        const storiesResponse = await fetch(`/api/stories?childProfileId=${childId}`)
        if (storiesResponse.ok) {
          const storiesData = await storiesResponse.json()
          setStories(storiesData)
        }

        // Load child's characters
        const charactersResponse = await fetch(`/api/characters?childProfileId=${childId}`)
        if (charactersResponse.ok) {
          const charactersData = await charactersResponse.json()
          setCharacters(charactersData)
        }
      } catch (error) {
        console.error('Error loading child data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadChildData()
  }, [session, router, childId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-200 via-purple-100 to-pink-200">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <LoadingSpinner size="xl" variant="magic" />
              <p className="text-purple-700 font-medium mt-4 text-lg">✨ Loading {childProfile?.name || 'child'}&apos;s profile ✨</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!childProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-200 via-purple-100 to-pink-200">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-purple-800 mb-4">Child profile not found</h1>
            <Button onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-purple-100 to-pink-200 relative overflow-hidden">
      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-4xl animate-float opacity-20">🎈</div>
        <div className="absolute top-32 right-20 text-3xl animate-bounce-slow opacity-30">⭐</div>
        <div className="absolute bottom-40 left-16 text-4xl animate-float opacity-25">🎪</div>
        <div className="absolute bottom-32 right-24 text-3xl animate-bounce-slow opacity-20">🎨</div>
      </div>

      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 relative">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard')}
            className="hover:scale-105 transition-all duration-200"
          >
            ← Back to Dashboard
          </Button>
        </div>

        {/* Child Profile Header */}
        <div className="mb-8">
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
            <CardContent className="flex items-center space-x-4 p-0">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">{childProfile.name[0]}</span>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                  {childProfile.name}&apos;s Story World ✨
                </h1>
                <p className="text-purple-600 font-medium">🎂 Age {childProfile.age}</p>
                {childProfile.interests && childProfile.interests.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {childProfile.interests.slice(0, 5).map((interest) => (
                      <span 
                        key={interest}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <CardContent className="text-center p-0">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-white text-2xl">✨</span>
              </div>
              <CardTitle className="mb-3 text-blue-800">Create New Story</CardTitle>
              <p className="text-gray-600 mb-4">Start a magical adventure for {childProfile.name}</p>
              <Button 
                className="w-full" 
                onClick={() => router.push(`/stories/create?childId=${childProfile.id}`)}
              >
                Create Story
              </Button>
            </CardContent>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <CardContent className="text-center p-0">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-white text-2xl">🎭</span>
              </div>
              <CardTitle className="mb-3 text-green-800">Create Character</CardTitle>
              <p className="text-green-700 mb-4 font-medium">Design a new character for {childProfile.name}</p>
              <Button 
                variant="outline" 
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0" 
                onClick={() => router.push(`/characters/create?childId=${childProfile.id}`)}
              >
                Create Character
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stories Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              📚 {childProfile.name}&apos;s Stories
            </h2>
            {stories.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => router.push(`/stories?childId=${childProfile.id}`)}
              >
                View All Stories
              </Button>
            )}
          </div>
          
          {stories.length === 0 ? (
            <Card className="p-8 text-center border-dashed border-2 border-gray-300">
              <CardContent className="p-0">
                <div className="text-4xl mb-4">📖</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No stories yet</h3>
                <p className="text-gray-600 mb-4">
                  {childProfile.name} hasn&apos;t started any magical adventures yet!
                </p>
                <Button onClick={() => router.push(`/stories/create?childId=${childProfile.id}`)}>
                  Create First Story
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stories.slice(0, 6).map((story) => (
                <Card 
                  key={story.id} 
                  className="p-4 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
                  onClick={() => router.push(`/stories/${story.id}`)}
                >
                  <CardContent className="p-0">
                    <h3 className="font-bold text-purple-800 mb-2 line-clamp-2">{story.title}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{story.summary}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {story.theme}
                      </span>
                      <span>
                        {new Date(story.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Characters Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              🎭 {childProfile.name}&apos;s Characters
            </h2>
            {characters.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => router.push(`/characters?childId=${childProfile.id}`)}
              >
                View All Characters
              </Button>
            )}
          </div>
          
          {characters.length === 0 ? (
            <Card className="p-8 text-center border-dashed border-2 border-gray-300">
              <CardContent className="p-0">
                <div className="text-4xl mb-4">🎭</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No characters yet</h3>
                <p className="text-gray-600 mb-4">
                  Create some colorful characters for {childProfile.name}&apos;s stories!
                </p>
                <Button onClick={() => router.push(`/characters/create?childId=${childProfile.id}`)}>
                  Create First Character
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {characters.slice(0, 8).map((character) => (
                <Card 
                  key={character.id} 
                  className="p-4 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
                  onClick={() => router.push(`/characters/${character.id}`)}
                >
                  <CardContent className="text-center p-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mb-3 mx-auto">
                      <span className="text-white font-bold text-lg">{character.name[0]}</span>
                    </div>
                    <h3 className="font-bold text-purple-800 mb-1 line-clamp-1">{character.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{character.personalityDescription}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
