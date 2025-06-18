// Reading Progress Analytics Dashboard
// Displays comprehensive reading analytics and progress tracking

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useSession } from 'next-auth/react'

interface ReadingProgressData {
  id: string
  userId: string
  childProfileId: string
  storyId: string
  currentPageNumber: number
  totalPages: number
  progressPercent: number
  timeSpent: number
  isCompleted: boolean
  deviceType: string
  sessionId: string
  createdAt: string
  updatedAt: string
  story: {
    id: string
    title: string
    theme: string
    childProfile: {
      id: string
      name: string
    }
  }
}

interface ReadingProgressSummary {
  totalStoriesRead: number
  totalTimeSpent: number
  averageCompletionRate: number
  favoriteGenres: string[]
  readingStreak: number
  storiesInProgress: number
  completedStories: number
}

interface ReadingProgressDashboardProps {
  childProfileId?: string
  className?: string
}

export function ReadingProgressDashboard({ childProfileId, className = '' }: ReadingProgressDashboardProps) {
  const { data: session } = useSession()
  const [progressData, setProgressData] = useState<ReadingProgressData[]>([])
  const [summary, setSummary] = useState<ReadingProgressSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (session?.user?.id) {
      loadReadingProgress()
    }
  }, [session?.user?.id, childProfileId])

  const loadReadingProgress = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        ...(childProfileId && { childProfileId })
      })
      
      const response = await fetch(`/api/reading-progress?${params}`)
      if (response.ok) {
        const data = await response.json()
        setProgressData(data.progress || [])
        setSummary(data.summary || null)
      } else {
        setError('Failed to load reading progress')
      }
    } catch (error) {
      console.error('Error loading reading progress:', error)
      setError('Error loading reading progress')
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const getDeviceIcon = (deviceType: string): string => {
    switch (deviceType) {
      case 'mobile': return '📱'
      case 'tablet': return '📱'
      case 'desktop': return '💻'
      default: return '📖'
    }
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-rose-500 rounded-lg animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reading progress...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadReadingProgress} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {summary.totalStoriesRead}
                </div>
                <div className="text-sm text-gray-600">Stories Read</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {formatTime(summary.totalTimeSpent)}
                </div>
                <div className="text-sm text-gray-600">Total Time</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {Math.round(summary.averageCompletionRate)}%
                </div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {summary.readingStreak}
                </div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Reading Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📚 Recent Reading Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {progressData.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">📖</div>
              <p className="text-gray-600">No reading progress data yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Start reading stories to see your progress here!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {progressData.slice(0, 10).map((progress) => (
                <div key={progress.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">
                        {progress.story.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>👤 {progress.story.childProfile.name}</span>
                        <span>🎭 {progress.story.theme}</span>
                        <span>{getDeviceIcon(progress.deviceType)} {progress.deviceType}</span>
                        <span>⏱️ {formatTime(progress.timeSpent)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-800">
                        {progress.currentPageNumber} / {progress.totalPages}
                      </div>
                      <div className="text-xs text-gray-500">
                        {progress.isCompleted ? '✅ Completed' : '📖 In Progress'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{Math.round(progress.progressPercent)}%</span>
                    </div>
                    <Progress 
                      value={progress.progressPercent} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Last read: {new Date(progress.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
              
              {progressData.length > 10 && (
                <div className="text-center">
                  <Button variant="outline" size="sm">
                    View All Progress ({progressData.length} total)
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Favorite Genres */}
      {summary?.favoriteGenres && summary.favoriteGenres.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🎭 Favorite Story Themes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {summary.favoriteGenres.map((genre, index) => (
                <span
                  key={genre}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    index === 0 
                      ? 'bg-orange-100 text-orange-800' 
                      : index === 1 
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {genre.charAt(0).toUpperCase() + genre.slice(1)}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
