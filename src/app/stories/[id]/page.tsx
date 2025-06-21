'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChildProfile, Character } from '@/types'
import { SegmentAnalytics, getDeviceType, generateSessionId, PerformanceTracker } from '@/lib/segment-analytics'
import { IllustrationPreloader } from '@/components/illustration-preloader'

interface EnhancedStoryPage {
  id: string
  pageNumber: number
  content: string
  characterDescriptions: Record<string, string>
  illustration?: {
    id: string
    url: string
    prompt: string
    createdAt: string
  } | null
}

interface EnhancedStory {
  id: string
  title: string
  theme: string
  summary: string
  moralLesson?: string
  currentPage: number
  isCompleted: boolean
  readingProgress: number
  childProfileId: string
  childProfile?: ChildProfile
  ageGroup: string
  pages: EnhancedStoryPage[]
  characters: Character[]
  characterIds: string[]
  createdAt: string
  updatedAt: string
}

export default function StoryReader() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const storyId = params.id as string
  
  const [story, setStory] = useState<EnhancedStory | null>(null)
  const [childProfile, setChildProfile] = useState<ChildProfile | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionStartTime] = useState(Date.now())
  const [sessionId] = useState(generateSessionId())
  const [deviceType] = useState(getDeviceType())
  const [pageStartTime, setPageStartTime] = useState(Date.now())
  const [hasTrackedReadingStart, setHasTrackedReadingStart] = useState(false)
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({})

  // Track session end when component unmounts
  useEffect(() => {
    return () => {
      if (session?.user?.id && hasTrackedReadingStart) {
        const sessionDuration = Math.round((Date.now() - sessionStartTime) / 1000)
        
        SegmentAnalytics.trackSessionEnded({
          userId: session.user.id,
          sessionId,
          sessionDuration,
          pagesViewed: currentPage + 1,
          storiesRead: 1
        })
      }
    }
  }, [session?.user?.id, hasTrackedReadingStart, sessionStartTime, sessionId, currentPage])

  useEffect(() => {
    const fetchStory = async () => {
      try {
        PerformanceTracker.startMeasurement('story-load')
        
        const response = await fetch(`/api/stories/${storyId}`)
        if (response.ok) {
          const data = await response.json()
          setStory(data.story)
          setCurrentPage(data.story.currentPage - 1) // Convert to 0-based index
          setChildProfile(data.story.childProfile || null)
          
          PerformanceTracker.endMeasurement('story-load')
          
          // Track story reading started
          if (session?.user?.id && data.story.childProfileId) {
            SegmentAnalytics.trackReadingStarted({
              userId: session.user.id,
              childProfileId: data.story.childProfileId,
              storyId: data.story.id,
              totalPages: data.story.pages.length,
              deviceType,
              sessionId
            })
            setHasTrackedReadingStart(true)
          }
        } else {
          console.error('Failed to fetch story')
          router.push('/stories')
        }
      } catch (error) {
        console.error('Error fetching story:', error)
        router.push('/stories')
      } finally {
        setIsLoading(false)
      }
    }

    if (storyId && session) {
      fetchStory()
    }
  }, [storyId, session, router, deviceType, sessionId])

  const updateReadingProgress = async (pageIndex: number) => {
    if (!story || !session?.user?.id) return

    try {
      const progressPercent = Math.round(((pageIndex + 1) / story.pages.length) * 100)
      
      // Track page view analytics
      const timeOnPage = Date.now() - pageStartTime
      const currentPageData = story.pages[pageIndex]
      
      SegmentAnalytics.trackPageViewed({
        userId: session.user.id,
        childProfileId: story.childProfileId,
        storyId: story.id,
        pageNumber: pageIndex + 1,
        hasIllustration: !!currentPageData?.illustration,
        timeOnPage,
        deviceType,
        sessionId
      })

      // Track reading progress
      SegmentAnalytics.trackReadingProgress({
        userId: session.user.id,
        childProfileId: story.childProfileId,
        storyId: story.id,
        currentPage: pageIndex + 1,
        totalPages: story.pages.length,
        progressPercent,
        timeSpent: Math.round((Date.now() - sessionStartTime) / 1000),
        deviceType,
        sessionId
      })

      // Track illustration view if present
      if (currentPageData?.illustration) {
        PerformanceTracker.startMeasurement(`illustration-${currentPageData.illustration.id}`)
        
        SegmentAnalytics.trackIllustrationViewed({
          userId: session.user.id,
          childProfileId: story.childProfileId,
          storyId: story.id,
          pageNumber: pageIndex + 1,
          illustrationId: currentPageData.illustration.id,
          loadTime: 0, // Will be updated when image loads
          deviceType
        })
      }

      // Update the enhanced reading progress API
      await fetch('/api/reading-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storyId: story.id,
          childProfileId: story.childProfileId,
          currentPageNumber: pageIndex + 1,
          totalPages: story.pages.length,
          timeSpent: Math.round((Date.now() - sessionStartTime) / 1000),
          deviceType,
          sessionId
        }),
      })

      // Also update the legacy story API for backward compatibility
      await fetch(`/api/stories/${storyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPage: pageIndex + 1,
          isCompleted: pageIndex >= story.pages.length - 1,
          readingProgress: ((pageIndex + 1) / story.pages.length) * 100
        }),
      })
    } catch (error) {
      console.error('Error updating reading progress:', error)
    }
  }

  const goToPage = async (pageIndex: number) => {
    if (!story || !session?.user?.id) return
    
    const newPage = Math.max(0, Math.min(pageIndex, story.pages.length - 1))
    
    setCurrentPage(newPage)
    setPageStartTime(Date.now()) // Reset page timer
    
    // Update reading progress with analytics
    await updateReadingProgress(newPage)
    
    // Check if story is completed and track completion
    const isCompleted = newPage >= story.pages.length - 1
    if (isCompleted && !story.isCompleted) {
      const totalTimeSpent = Math.round((Date.now() - sessionStartTime) / 1000)
      
      SegmentAnalytics.trackReadingCompleted({
        userId: session.user.id,
        childProfileId: story.childProfileId,
        storyId: story.id,
        totalPages: story.pages.length,
        totalTimeSpent,
        deviceType,
        sessionId
      })
    }
    
    // Update local state
    const readingProgress = ((newPage + 1) / story.pages.length) * 100
    
    const updatedStory: EnhancedStory = { 
      ...story, 
      currentPage: newPage + 1,
      isCompleted,
      readingProgress
    }
    setStory(updatedStory)
  }

  const nextPage = () => goToPage(currentPage + 1)
  const prevPage = () => goToPage(currentPage - 1)

  // Reset image loading state when page changes
  useEffect(() => {
    if (story && story.pages[currentPage]?.illustration) {
      const illustrationId = story.pages[currentPage].illustration!.id
      // Reset loading state for the current page illustration
      setImageLoadingStates(prev => ({
        ...prev,
        [illustrationId]: undefined
      }))
    }
  }, [currentPage, story])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-rose-500 rounded-lg animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your magical story...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
          <Card className="p-12 text-center">
            <CardContent className="p-0">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-white text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Story Not Found</h3>
              <p className="text-gray-600 mb-6">The story you&apos;re looking for doesn&apos;t exist.</p>
              <Button onClick={() => router.push('/stories')}>
                Back to Library
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const currentPageData = story.pages[currentPage]
  const progress = Math.round(((currentPage + 1) / story.pages.length) * 100)

  // Prepare illustrations for preloader
  const illustrations = story.pages
    .map((page, index) => page.illustration ? {
      id: page.illustration.id,
      url: page.illustration.url,
      pageNumber: index
    } : null)
    .filter(Boolean) as Array<{ id: string; url: string; pageNumber: number }>

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <Header />
      
      {/* Preload illustrations for better performance */}
      <IllustrationPreloader
        illustrations={illustrations}
        currentPage={currentPage}
        userId={session?.user?.id}
        childProfileId={story.childProfileId}
        storyId={story.id}
        deviceType={deviceType}
      />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        {/* Story Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/stories')}
              className="flex items-center gap-2"
            >
              ← Back to Library
            </Button>
            
            <div className="text-sm text-gray-600">
              Page {currentPage + 1} of {story.pages.length}
            </div>
          </div>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent mb-2">
            {story.title}
          </h1>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {childProfile && <span>For {childProfile.name}</span>}
            <span>•</span>
            <span>{story.theme.charAt(0).toUpperCase() + story.theme.slice(1)}</span>
            {story.moralLesson && (
              <>
                <span>•</span>
                <span>Lesson: {story.moralLesson.charAt(0).toUpperCase() + story.moralLesson.slice(1)}</span>
              </>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Reading Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-orange-500 to-rose-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Story Content */}
        <Card className="mb-8">
          {/* Enhanced Illustration Display */}
          <div className="h-64 md:h-80 relative rounded-t-2xl overflow-hidden">
            {currentPageData.illustration?.url ? (
              <div className="relative w-full h-full">
                <Image
                  src={currentPageData.illustration.url}
                  alt={`Illustration for page ${currentPage + 1} of ${story.title}`}
                  fill
                  className="object-cover"
                  onLoad={() => {
                    // Mark image as loaded
                    setImageLoadingStates(prev => ({
                      ...prev,
                      [currentPageData.illustration!.id]: true
                    }))
                    
                    // Track illustration load performance
                    const loadTime = PerformanceTracker.endMeasurement(`illustration-${currentPageData.illustration!.id}`)
                    
                    if (session?.user?.id && loadTime > 0) {
                      SegmentAnalytics.trackIllustrationViewed({
                        userId: session.user.id,
                        childProfileId: story.childProfileId,
                        storyId: story.id,
                        pageNumber: currentPage + 1,
                        illustrationId: currentPageData.illustration!.id,
                        loadTime,
                        deviceType
                      })
                    }
                  }}
                  onError={(e) => {
                    // Mark image as failed
                    setImageLoadingStates(prev => ({
                      ...prev,
                      [currentPageData.illustration!.id]: false
                    }))
                    
                    // Track illustration load failure
                    PerformanceTracker.endMeasurement(`illustration-${currentPageData.illustration!.id}`)
                    
                    if (session?.user?.id) {
                      SegmentAnalytics.trackIllustrationGeneration({
                        userId: session.user.id,
                        childProfileId: story.childProfileId,
                        storyId: story.id,
                        pageNumber: currentPage + 1,
                        prompt: currentPageData.illustration!.prompt || '',
                        success: false,
                        error: 'Image failed to load'
                      })
                    }
                    
                    // Fallback to theme emoji if image fails to load
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
                
                {/* Loading overlay - only show when image hasn't loaded yet */}
                {imageLoadingStates[currentPageData.illustration.id] !== true && (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-white/30 rounded-lg animate-pulse mx-auto mb-2"></div>
                      <p className="text-gray-600 text-sm">Loading illustration...</p>
                    </div>
                  </div>
                )}
                
                {/* Illustration attribution */}
                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  AI Generated
                </div>
              </div>
            ) : (
              // Fallback display with theme emoji
              <div className="h-full bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">
                    {story.theme === 'fantasy' ? '🏰' : 
                     story.theme === 'magic' ? '🌟' : 
                     story.theme === 'space' ? '🚀' : 
                     story.theme === 'ocean' ? '🌊' : 
                     story.theme === 'adventure' ? '🏝️' : '📖'}
                  </div>
                  <p className="text-gray-600 text-sm">
                    {currentPageData.illustration ? 'Illustration loading...' : 'Illustration generating...'}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <CardContent className="p-8">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-800 leading-relaxed text-lg">
                {currentPageData.content}
              </p>
            </div>
            
            {/* Character Descriptions for this page */}
            {Object.keys(currentPageData.characterDescriptions).length > 0 && (
              <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Characters in this scene:</h4>
                <div className="space-y-2">
                  {Object.entries(currentPageData.characterDescriptions).map(([charId, description]) => {
                    const character = story.characters.find((c: Character) => c.id === charId)
                    return (
                      <p key={charId} className="text-sm text-purple-700">
                        <strong>{character?.name || 'Character'}:</strong> {description}
                      </p>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={prevPage}
            disabled={currentPage === 0}
            className="flex items-center gap-2"
          >
            ← Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {story.pages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToPage(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentPage 
                    ? 'bg-orange-500' 
                    : index <= currentPage 
                    ? 'bg-orange-300' 
                    : 'bg-gray-300'
                }`}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
          
          <Button 
            variant="outline" 
            onClick={nextPage}
            disabled={currentPage === story.pages.length - 1}
            className="flex items-center gap-2"
          >
            Next →
          </Button>
        </div>
        
        {/* Completion Message */}
        {currentPage === story.pages.length - 1 && !story.isCompleted && (
          <Card className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="text-center p-0">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold text-green-800 mb-2">
                Congratulations!
              </h3>
              <p className="text-green-700 mb-4">
                You&apos;ve finished reading &quot;{story.title}&quot;!
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => router.push('/stories')}>
                  Back to Library
                </Button>
                <Button variant="outline" onClick={() => goToPage(0)}>
                  Read Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
