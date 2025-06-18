'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Recommendations } from '@/components/recommendations'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ChildProfile {
  id: string
  name: string
  age: number
}

function RecommendationsContent() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([])
  const [selectedChild, setSelectedChild] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  const loadChildProfiles = useCallback(async () => {
    try {
      const response = await fetch('/api/child-profiles')
      if (response.ok) {
        const profiles = await response.json()
        setChildProfiles(profiles)
        
        // Auto-select first child if none selected
        if (!selectedChild && profiles.length > 0) {
          setSelectedChild(profiles[0].id)
        }
      }
    } catch (error) {
      console.error('Error loading child profiles:', error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedChild])

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/auth/signin'
      return
    }

    if (session) {
      loadChildProfiles()
    }
  }, [session, status, loadChildProfiles])

  useEffect(() => {
    const childId = searchParams.get('childProfileId')
    if (childId) {
      setSelectedChild(childId)
    }
  }, [searchParams])

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid gap-6 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (childProfiles.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <Card className="max-w-md mx-auto mt-20">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                No Child Profiles Found
              </h1>
              <p className="text-gray-600 mb-6">
                Create a child profile first to get personalized story recommendations.
              </p>
              <Button onClick={() => window.location.href = '/dashboard'}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent mb-4">
            📚 Story Recommendations
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Discover perfect stories tailored to your child&apos;s favorite characters and themes
          </p>
        </div>

        {/* Child Profile Selector */}
        {childProfiles.length > 1 && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <label className="block text-lg font-semibold text-gray-800 mb-3">
                Select Child Profile
              </label>
              <div className="flex flex-wrap gap-3">
                {childProfiles.map((profile) => (
                  <Button
                    key={profile.id}
                    variant={selectedChild === profile.id ? "primary" : "outline"}
                    onClick={() => setSelectedChild(profile.id)}
                    className={selectedChild === profile.id ? 
                      "bg-gradient-to-r from-orange-500 to-rose-500" : 
                      "border-orange-300 text-orange-700 hover:bg-orange-50"
                    }
                  >
                    {profile.name} ({profile.age} years)
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations Section */}
        {selectedChild && (
          <div className="space-y-8">
            {/* Featured Recommendations */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-purple-800 mb-2">
                  ✨ Perfect Matches for {childProfiles.find(p => p.id === selectedChild)?.name}
                </h2>
                <p className="text-purple-600 mb-6">
                  Stories specially chosen based on favorite characters and reading history
                </p>
                <Recommendations 
                  childProfileId={selectedChild}
                  quick={false}
                />
              </CardContent>
            </Card>

            {/* Tips for Better Recommendations */}
            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-blue-800 mb-4">
                  💡 Tips for Better Recommendations
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-blue-700">
                  <div className="space-y-2">
                    <p className="flex items-start">
                      <span className="mr-2">🎭</span>
                      <span>Create diverse characters with different personalities</span>
                    </p>
                    <p className="flex items-start">
                      <span className="mr-2">📖</span>
                      <span>Read stories regularly to build preferences</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="flex items-start">
                      <span className="mr-2">🎨</span>
                      <span>Try different themes and genres</span>
                    </p>
                    <p className="flex items-start">
                      <span className="mr-2">⭐</span>
                      <span>Use the same characters across multiple stories</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="text-4xl mb-3">🎭</div>
                  <h3 className="font-bold text-gray-800 mb-2">Create Character</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Design a new character for future story recommendations
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = '/characters/create'}
                    className="w-full"
                  >
                    Create Character
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="text-4xl mb-3">📚</div>
                  <h3 className="font-bold text-gray-800 mb-2">Browse Stories</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    View your existing story library and reading progress
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = '/stories'}
                    className="w-full"
                  >
                    View Stories
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="text-4xl mb-3">✍️</div>
                  <h3 className="font-bold text-gray-800 mb-2">Create Story</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Start a new adventure with your favorite characters
                  </p>
                  <Button 
                    onClick={() => window.location.href = `/stories/create?childProfileId=${selectedChild}`}
                    className="w-full bg-gradient-to-r from-orange-500 to-rose-500"
                  >
                    Create Story
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function RecommendationsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading recommendations...</p>
      </div>
    </div>}>
      <RecommendationsContent />
    </Suspense>
  )
}
