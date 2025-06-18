'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { ChildProfile, Story } from '@/types'

export default function StoryLibrary() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stories, setStories] = useState<Story[]>([])
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([])
  const [selectedChild, setSelectedChild] = useState<string>('all')
  const [selectedTheme, setSelectedTheme] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  // Redirect if not authenticated
  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, router])

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load child profiles
        const profilesResponse = await fetch('/api/child-profiles')
        if (profilesResponse.ok) {
          const profiles = await profilesResponse.json()
          setChildProfiles(profiles)
        }

        // Load all stories
        const storiesResponse = await fetch('/api/stories')
        if (storiesResponse.ok) {
          const allStories = await storiesResponse.json()
          setStories(allStories)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      loadData()
    }
  }, [session])

  const filteredStories = stories.filter(story => {
    const childMatch = selectedChild === 'all' || story.childProfileId === selectedChild
    const themeMatch = selectedTheme === 'all' || story.theme === selectedTheme
    return childMatch && themeMatch
  })

  const themes = Array.from(new Set(stories.map(s => s.theme)))

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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 mx-auto animate-bounce-gentle shadow-lg">
                <span className="text-white text-3xl">📚</span>
              </div>
              <p className="text-purple-700 font-medium text-lg">✨ Loading your magical story library ✨</p>
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
        <div className="absolute top-20 left-10 text-4xl animate-float opacity-20">📚</div>
        <div className="absolute top-32 right-20 text-3xl animate-bounce-slow opacity-30">⭐</div>
        <div className="absolute top-60 left-1/4 text-5xl animate-float-delayed opacity-15">🌈</div>
        <div className="absolute bottom-40 left-16 text-4xl animate-float opacity-25">🎨</div>
        <div className="absolute bottom-32 right-24 text-3xl animate-bounce-slow opacity-20">✨</div>
        <div className="absolute top-80 right-1/3 text-2xl animate-bounce-gentle opacity-25">🦋</div>
      </div>
      
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 relative">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent mb-2 animate-text-glow">
            📚 Magical Story Library ✨
          </h1>
          <p className="text-purple-700 font-medium text-lg">🌟 Browse and continue reading your colorful adventures! 🎨</p>
        </div>

        {/* Enhanced Filters with Cartoon Theme */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-xl">🔍</span>
            Find Your Perfect Story
          </h2>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2 flex items-center gap-1">
                <span>👧👦</span> Filter by Child
              </label>
              <select 
                value={selectedChild} 
                onChange={(e) => setSelectedChild(e.target.value)}
                className="px-4 py-2 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-white/90 transition-all duration-200 hover:shadow-md"
              >
                <option value="all">✨ All Children ✨</option>
                {childProfiles.map(profile => (
                  <option key={profile.id} value={profile.id}>🌟 {profile.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2 flex items-center gap-1">
                <span>🎨</span> Filter by Theme
              </label>
              <select 
                value={selectedTheme} 
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="px-4 py-2 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-white/90 transition-all duration-200 hover:shadow-md"
              >
                <option value="all">🌈 All Themes 🌈</option>
                {themes.map(theme => {
                  const themeEmojis: Record<string, string> = {
                    fantasy: '🏰',
                    magic: '🌟',
                    space: '🚀',
                    ocean: '🌊',
                    adventure: '🏝️',
                    circus: '🎪',
                    dreams: '💭',
                    creative: '🎨'
                  }
                  return (
                    <option key={theme} value={theme}>
                      {themeEmojis[theme]} {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </option>
                  )
                })}
              </select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={() => window.location.href = '/stories/create'}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                <span className="text-lg">✨</span>
                Create New Story
                <span className="text-lg">🎨</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Stories Grid with Cartoon Theme */}
        {filteredStories.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 text-center shadow-lg border border-white/20">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 via-pink-500 to-orange-400 rounded-full flex items-center justify-center mb-6 mx-auto animate-bounce-gentle shadow-lg">
              <span className="text-white text-3xl">📚</span>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-3">
              {selectedChild !== 'all' || selectedTheme !== 'all' ? '🔍 No Stories Match Your Filters' : '✨ Your Story Library Awaits! ✨'}
            </h3>
            <p className="text-purple-700 font-medium mb-8 text-lg">
              {selectedChild !== 'all' || selectedTheme !== 'all' 
                ? '🎯 Try adjusting your filters or create a new magical adventure!' 
                : (childProfiles.length > 0 
                    ? '🌟 Ready to create some amazing stories for your little ones? 🌈'
                    : '🌟 First, let\'s set up a child profile, then create amazing stories! 🌈')}
            </p>
            <Button 
              onClick={() => {
                // If user has child profiles, go to story creation
                // If not, go to dashboard to create a child profile first
                if (childProfiles.length > 0) {
                  router.push('/stories/create')
                } else {
                  router.push('/dashboard')
                }
              }}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3 mx-auto text-lg"
            >
              <span className="text-xl">🎨</span>
              {childProfiles.length > 0 ? 'Create Your First Story' : 'Set Up Profile & Create Story'}
              <span className="text-xl">✨</span>
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map((story) => {
              const progress = Math.round((story.currentPage / story.StoryPage.length) * 100)
              const childProfile = childProfiles.find(p => p.id === story.childProfileId)
              
              const themeEmojis: Record<string, string> = {
                fantasy: '🏰',
                magic: '🌟',
                space: '🚀',
                ocean: '🌊',
                adventure: '🏝️',
                circus: '🎪',
                dreams: '💭',
                creative: '🎨'
              }

              const themeGradients: Record<string, string> = {
                fantasy: 'from-purple-300 via-pink-200 to-indigo-300',
                magic: 'from-yellow-200 via-pink-200 to-purple-300',
                space: 'from-blue-300 via-indigo-200 to-purple-300',
                ocean: 'from-blue-200 via-cyan-200 to-teal-300',
                adventure: 'from-green-200 via-emerald-200 to-blue-300',
                circus: 'from-red-200 via-yellow-200 to-pink-300',
                dreams: 'from-purple-200 via-blue-200 to-pink-200',
                creative: 'from-orange-200 via-pink-200 to-purple-300'
              }

              return (
                <div key={story.id} className="bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-white/20 hover:shadow-xl transform hover:scale-105 transition-all duration-300 group">
                  <div className={`h-36 bg-gradient-to-br ${themeGradients[story.theme] || 'from-blue-200 to-purple-300'} flex items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-2 left-3 text-2xl animate-float">⭐</div>
                      <div className="absolute bottom-3 right-2 text-xl animate-bounce-slow">✨</div>
                      <div className="absolute top-4 right-4 text-lg animate-float-delayed">🌟</div>
                    </div>
                    <span className="text-5xl group-hover:animate-bounce-gentle transition-all duration-300">
                      {themeEmojis[story.theme] || '📖'}
                    </span>
                    {!story.isCompleted && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                        {progress}% ✨
                      </div>
                    )}
                    {story.isCompleted && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                        ✓ Complete 🌟
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-purple-700 transition-colors">
                        {story.title}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p className="text-purple-600 font-medium flex items-center gap-1">
                          <span>{themeEmojis[story.theme]}</span>
                          {story.theme.charAt(0).toUpperCase() + story.theme.slice(1)} • 📄 {story.StoryPage.length} pages
                        </p>
                        {childProfile && (
                          <p className="text-blue-600 font-medium flex items-center gap-1">
                            <span>👧👦</span>
                            For {childProfile.name} (age {childProfile.age})
                          </p>
                        )}
                        {story.StoryCharacter.length > 0 && (
                          <p className="text-gray-600 text-xs flex items-center gap-1">
                            <span>🎭</span>
                            Characters: {story.StoryCharacter.map(sc => sc.Character.name).join(', ')}
                          </p>
                        )}
                        {story.moralLesson && (
                          <p className="text-purple-600 text-xs flex items-center gap-1">
                            <span>💡</span>
                            Lesson: {story.moralLesson.charAt(0).toUpperCase() + story.moralLesson.slice(1)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2 italic">&ldquo;{story.summary}&rdquo;</p>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                        onClick={() => window.location.href = `/stories/${story.id}`}
                      >
                        {story.isCompleted ? '📖 Read Again' : '📚 Continue Reading'}
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="px-3 hover:bg-purple-100 rounded-xl transition-all duration-200"
                        onClick={() => {
                          // TODO: Implement story options (edit, delete, share)
                          alert('Story options coming soon!')
                        }}
                      >
                        <span className="text-lg">⋯</span>
                      </Button>
                    </div>

                    {/* Enhanced Reading Progress Bar */}
                    {!story.isCompleted && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-purple-600 font-medium">
                          <span className="flex items-center gap-1">
                            <span>📖</span> Progress
                          </span>
                          <span>{story.currentPage} of {story.StoryPage.length}</span>
                        </div>
                        <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-3 shadow-inner">
                          <div 
                            className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 h-3 rounded-full transition-all duration-500 shadow-md relative overflow-hidden" 
                            style={{ width: `${progress}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Enhanced Quick Stats with Cartoon Theme */}
        {filteredStories.length > 0 && (
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/20 hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-4 mx-auto animate-bounce-gentle shadow-lg">
                <span className="text-white text-2xl">📚</span>
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
                {filteredStories.length}
              </div>
              <p className="text-purple-700 font-medium">✨ Total Stories ✨</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/20 hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4 mx-auto animate-bounce-gentle shadow-lg">
                <span className="text-white text-2xl">🏆</span>
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent mb-2">
                {filteredStories.filter(s => s.isCompleted).length}
              </div>
              <p className="text-purple-700 font-medium">🌟 Completed 🌟</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/20 hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mb-4 mx-auto animate-bounce-gentle shadow-lg">
                <span className="text-white text-2xl">🎭</span>
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-2">
                {new Set(filteredStories.flatMap(s => s.characterIds)).size}
              </div>
              <p className="text-purple-700 font-medium">🎨 Unique Characters 🎨</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
