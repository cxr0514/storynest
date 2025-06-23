'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading'
import { Recommendations } from '@/components/recommendations'
import { SubscriptionStatus } from '@/components/subscription-status'
import { ChildProfileModal } from '@/components/child-profile-modal'
import { ChildProfile, Story } from '@/types'

export default function Dashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([])
  const [recentStories, setRecentStories] = useState<Story[]>([])
  const [childStories, setChildStories] = useState<Record<string, Story[]>>({})
  const [childCharacterCounts, setChildCharacterCounts] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [showChildProfileModal, setShowChildProfileModal] = useState(false)

  // Load dashboard data function
  const loadDashboardData = useCallback(async () => {
    if (!session) return
    
    try {
      // Load child profiles
      const profilesResponse = await fetch('/api/child-profiles')
      if (profilesResponse.ok) {
        const profiles = await profilesResponse.json()
        setChildProfiles(profiles)
        
        // Load stories and character counts for each child
        const storiesData: Record<string, Story[]> = {}
        const characterCounts: Record<string, number> = {}
        const allStories: Story[] = []
        
        for (const profile of profiles) {
          // Load stories for this child
          const storiesResponse = await fetch(`/api/stories?childProfileId=${profile.id}`)
          if (storiesResponse.ok) {
            const stories = await storiesResponse.json()
            storiesData[profile.id] = stories
            allStories.push(...stories)
          }
          
          // Load character count for this child
          const charactersResponse = await fetch(`/api/characters?childProfileId=${profile.id}`)
          if (charactersResponse.ok) {
            const characters = await charactersResponse.json()
            characterCounts[profile.id] = characters.length
          }
        }
        
        setChildStories(storiesData)
        setChildCharacterCounts(characterCounts)
        
        // Sort all stories by date and take the 5 most recent
        const sortedStories = allStories
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 5)
        
        setRecentStories(sortedStories)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [session])

  // Handle child profile creation success
  const handleChildProfileSuccess = () => {
    setShowChildProfileModal(false)
    loadDashboardData()
  }

  // Redirect if not authenticated
  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, router])

  useEffect(() => {
    if (session) {
      loadDashboardData()
    }
  }, [session, loadDashboardData])

  // Initialize scroll animations
  useEffect(() => {
    const initScrollAnimations = () => {
      const scrollElements = document.querySelectorAll('.scroll-animate')
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in')
          }
        })
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      })

      scrollElements.forEach((el) => observer.observe(el))

      return () => observer.disconnect()
    }

    const cleanup = initScrollAnimations()
    return cleanup
  }, [childProfiles, recentStories])

  if (isLoading) {
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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center animate-scale-in">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mb-4 mx-auto animate-bounce-gentle shadow-lg">
                <span className="text-white text-3xl">📚</span>
              </div>
              <LoadingSpinner size="xl" variant="magic" />
              <p className="text-purple-700 font-medium mt-4 loading-dots text-lg">✨ Loading your magical stories ✨</p>
            </div>
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
        <div className="absolute top-60 left-1/4 text-5xl animate-float-delayed opacity-15">🌈</div>
        <div className="absolute bottom-40 left-16 text-4xl animate-float opacity-25">🎪</div>
        <div className="absolute bottom-32 right-24 text-3xl animate-bounce-slow opacity-20">🎨</div>
        <div className="absolute top-80 right-1/3 text-2xl animate-bounce-gentle opacity-25">🦋</div>
      </div>
      
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 relative">
        <div className="mb-8 scroll-animate">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent mb-2 hover:animate-gentle-bounce cursor-default animate-text-glow">
            🌟 Welcome to Your Story Kingdom! 🏰
          </h1>
          <p className="text-purple-700 font-medium text-lg">✨ Create magical bedtime stories with colorful characters that come to life! 🎨</p>
        </div>

        {/* Subscription Status */}
        <div className="mb-8 scroll-animate">
          <SubscriptionStatus />
        </div>

        {/* No Child Profiles State */}
        {childProfiles.length === 0 && (
          <div className="mb-8 scroll-animate">
            <Card className="p-8 animate-scale-in hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200" variant="glass">
              <CardContent className="text-center p-0">
                <div className="mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-gentle shadow-lg">
                    <span className="text-4xl">👶</span>
                  </div>
                  <h3 className="text-2xl font-bold text-purple-800 mb-2">🌟 Welcome to StoryNest! 🌟</h3>
                  <p className="text-purple-600 mb-6 text-lg font-medium">
                    ✨ Let&apos;s start by creating a magical child profile to personalize your colorful stories! 🎨
                  </p>
                  <Button 
                    onClick={() => setShowChildProfileModal(true)}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg hover:scale-110 transition-all duration-200 text-lg px-8 py-3"
                  >
                    🚀 Create Your First Child Profile ✨
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Child Profiles Summary */}
        {childProfiles.length > 0 && (
          <div className="mb-8 scroll-animate">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">👨‍👩‍👧‍👦 Your Magical Children</h2>
              <Button 
                variant="outline"
                onClick={() => setShowChildProfileModal(true)}
                className="border-2 border-purple-400 text-purple-600 hover:bg-purple-50 hover:scale-105 transition-all duration-200 font-medium"
              >
                ✨ Add Child Profile
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {childProfiles.map((profile, index) => {
                const profileStories = childStories[profile.id] || []
                const profileCharacterCount = childCharacterCounts[profile.id] || 0
                
                return (
                  <Card 
                    key={profile.id} 
                    className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer" 
                    hover 
                    animation="scale"
                    delay={index * 75}
                    onClick={() => router.push(`/child/${profile.id}`)}
                  >
                    <CardContent className="flex items-center space-x-3 p-0">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center animate-bounce-gentle shadow-lg cartoon-shadow overflow-hidden border-2 border-white">
                        {profile.avatarUrl ? (
                          <img
                            src={profile.avatarUrl}
                            alt={`${profile.name}'s avatar`}
                            className="w-full h-full object-cover rounded-full"
                            onError={(e) => {
                              // Fallback to initial if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`w-full h-full bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center ${profile.avatarUrl ? 'hidden' : 'flex'}`}
                          style={{ display: profile.avatarUrl ? 'none' : 'flex' }}
                        >
                          <span className="text-white font-bold text-lg">{profile.name[0]}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-purple-800 text-lg">{profile.name} ✨</h3>
                        <p className="text-sm text-purple-600 font-medium">🎂 Age {profile.age}</p>
                        <p className="text-xs text-blue-600">
                          📚 {profileStories.length} stories • 🎭 {profileCharacterCount} characters
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 scroll-animate">
          <Card hover className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 hover:shadow-xl hover:scale-105 transition-all duration-300" animation="slide" delay={0}>
            <CardContent className="text-center p-0">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mb-4 mx-auto animate-bounce-gentle shadow-lg">
                <span className="text-white text-2xl">✨</span>
              </div>
              <CardTitle className="mb-3 text-blue-800">🎨 Create New Story</CardTitle>
              <p className="text-gray-600 mb-4">Start a magical adventure with your child&apos;s favorite characters</p>
              <Button className="w-full" animation="glow" onClick={() => router.push('/stories/create')}>
                Create Story
              </Button>
            </CardContent>
          </Card>

          <Card hover className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 hover:shadow-xl hover:scale-105 transition-all duration-300" animation="slide" delay={150}>
            <CardContent className="text-center p-0">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 mx-auto animate-bounce-gentle shadow-lg">
                <span className="text-white text-2xl">🎭</span>
              </div>
              <CardTitle className="mb-3 text-green-800">🌟 Create Character</CardTitle>
              <p className="text-green-700 mb-4 font-medium">Design a new colorful character for future story adventures! 🎨</p>
              <Button 
                variant="outline" 
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 hover:scale-105 transition-all duration-200" 
                onClick={() => router.push('/characters/create')}
              >
                🎨 Create Character
              </Button>
            </CardContent>
          </Card>

          <Card hover className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 hover:shadow-xl hover:scale-105 transition-all duration-300" animation="slide" delay={300}>
            <CardContent className="text-center p-0">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mb-4 mx-auto animate-bounce-gentle shadow-lg">
                <span className="text-white text-2xl">📚</span>
              </div>
              <CardTitle className="mb-3 text-purple-800">📖 Story Library</CardTitle>
              <p className="text-purple-700 mb-4 font-medium">Browse your magical collection of colorful adventures! 🌈</p>
              <Button 
                variant="secondary" 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white hover:scale-105 transition-all duration-200" 
                onClick={() => router.push('/stories')}
              >
                📚 View Library
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Recommendations */}
        {childProfiles.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                📚 Recommended Stories
              </h2>
              <Button 
                variant="outline" 
                onClick={() => router.push(`/recommendations?childProfileId=${childProfiles[0].id}`)}
              >
                View All
              </Button>
            </div>
            <Recommendations 
              childProfileId={childProfiles[0].id} 
              quick={true}
              className="mb-8"
            />
          </section>
        )}

        {/* Recent Stories */}
        <section className="scroll-animate">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Recent Stories</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentStories.map((story, index) => {
              const progress = Math.round((story.currentPage / story.StoryPage.length) * 100)
              const childProfile = childProfiles.find(p => p.id === story.childProfileId)
              
              return (
                <Card 
                  key={story.id} 
                  className="overflow-hidden" 
                  hover 
                  animation="scale"
                  delay={index * 100}
                >
                  <div className="h-32 bg-gradient-to-br from-blue-200 to-purple-300 flex items-center justify-center hover:from-blue-300 hover:to-purple-400 transition-all duration-300">
                    <span className="text-4xl animate-gentle-bounce">
                      {story.theme === 'fantasy' ? '🏰' : 
                       story.theme === 'magic' ? '🌟' : 
                       story.theme === 'space' ? '🚀' : 
                       story.theme === 'ocean' ? '🌊' : '📖'}
                    </span>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{story.title}</CardTitle>
                    <p className="text-sm text-gray-600">
                      {story.isCompleted ? 'Completed' : `Progress: ${story.currentPage} of ${story.StoryPage.length} pages (${progress}%)`}
                    </p>
                    {childProfile && (
                      <p className="text-xs text-gray-500">For {childProfile.name}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" className="w-full">
                      {story.isCompleted ? 'Read Again' : 'Continue Reading'}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}

            {/* Create new story card */}
            <Card 
              hover 
              className="border-2 border-dashed border-orange-300 bg-orange-50/50 hover:border-orange-400 hover:bg-orange-100/50 transition-all duration-300 cursor-pointer" 
              onClick={() => router.push('/stories/create')}
              animation="scale"
              delay={recentStories.length * 100}
            >
              <CardContent className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-rose-400 rounded-xl flex items-center justify-center mb-4 hover:scale-110 transition-transform duration-200">
                  <span className="text-white text-xl">+</span>
                </div>
                <CardTitle className="mb-2">Create New Story</CardTitle>
                <p className="text-gray-600 text-sm">Start a new magical adventure</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      
      {/* Child Profile Modal */}
      <ChildProfileModal
        isOpen={showChildProfileModal}
        onClose={() => setShowChildProfileModal(false)}
        onSuccess={handleChildProfileSuccess}
      />
    </div>
  )
}
