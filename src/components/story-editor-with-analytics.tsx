'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RealTimeAnalyticsMonitor } from '@/components/real-time-analytics-monitor'
import { Character, StoryTheme } from '@/types'

interface AnalyticsData {
  basicConsistency: { consistencyScore: number };
  enhancedConsistency: { consistencyScore: number };
  realTimeFeedback: {
    visualConsistency: number;
    personalityConsistency: number;
    speechConsistency: number;
    behaviorConsistency: number;
    overallScore: number;
    warnings: string[];
    suggestions: string[];
  };
  suggestions: Array<{
    type: string;
    priority: string;
    message: string;
    details: string;
  }>;
}

interface StoryEditorProps {
  childProfileId: string
  selectedCharacters: string[]
  selectedTheme: StoryTheme
  moralLesson?: string
  onStoryCreate?: (storyId: string) => void
}

export function StoryEditor({ 
  childProfileId, 
  selectedCharacters, 
  selectedTheme, 
  moralLesson,
  onStoryCreate 
}: StoryEditorProps) {
  const router = useRouter()
  const { data: session } = useSession()
  
  const [storyContent, setStoryContent] = useState('')
  const [characters, setCharacters] = useState<Character[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentAnalytics, setCurrentAnalytics] = useState<AnalyticsData | null>(null)
  const [showAnalytics, setShowAnalytics] = useState(true)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    const loadCharacters = async () => {
      try {
        const promises = selectedCharacters.map(id =>
          fetch(`/api/characters/${id}`).then(res => res.json())
        )
        const charactersData = await Promise.all(promises)
        setCharacters(charactersData.filter(char => char && !char.error))
      } catch (error) {
        console.error('Failed to load characters:', error)
      }
    }

    if (selectedCharacters.length > 0) {
      loadCharacters()
    }
  }, [selectedCharacters])

  const handleAnalyticsUpdate = (analytics: AnalyticsData) => {
    setCurrentAnalytics(analytics)
    
    // Auto-adjust recommendations based on analytics
    if (analytics.realTimeFeedback.overallScore < 40) {
      // Show suggestions prominently
      setShowAnalytics(true)
    }
  }

  const generateStoryWithAI = async () => {
    if (!childProfileId || !selectedTheme || selectedCharacters.length === 0) {
      setErrors(['Missing required story parameters'])
      return
    }

    setIsGenerating(true)
    setErrors([])

    try {
      const response = await fetch('/api/stories/generate-with-analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme: selectedTheme,
          characterIds: selectedCharacters,
          childProfileId: childProfileId,
          moralLesson: moralLesson,
          customPrompt: storyContent,
          enhancedMode: true,
          realTimeAnalytics: true
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate story')
      }

      const data = await response.json()
      
      if (data.story?.content) {
        setStoryContent(data.story.content)
      }
      
      if (data.story?.id && onStoryCreate) {
        onStoryCreate(data.story.id)
      }

    } catch (error) {
      console.error('Error generating story:', error)
      setErrors([error instanceof Error ? error.message : 'Failed to generate story'])
    } finally {
      setIsGenerating(false)
    }
  }

  const saveStory = async () => {
    if (!storyContent.trim()) {
      setErrors(['Please write your story content first'])
      return
    }

    if (!childProfileId || selectedCharacters.length === 0) {
      setErrors(['Missing required story information'])
      return
    }

    setIsGenerating(true)
    setErrors([])

    try {
      const response = await fetch('/api/stories/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `${selectedTheme} Adventure`,
          content: storyContent,
          theme: selectedTheme,
          characterIds: selectedCharacters,
          childProfileId: childProfileId,
          moralLesson: moralLesson,
          analytics: currentAnalytics
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save story')
      }

      const data = await response.json()
      
      if (data.story?.id) {
        router.push(`/stories/${data.story.id}`)
      }

    } catch (error) {
      console.error('Error saving story:', error)
      setErrors([error instanceof Error ? error.message : 'Failed to save story'])
    } finally {
      setIsGenerating(false)
    }
  }

  if (!session) {
    return <div>Please sign in to continue</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent mb-2">
            Story Editor with Real-Time Analytics
          </h1>
          <p className="text-gray-600">
            Write your story and get real-time feedback on character consistency
          </p>
        </div>

        {errors.length > 0 && (
          <Card className="mb-6 p-4 border-red-200 bg-red-50 animate-slide-in">
            <CardContent className="p-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-red-500 animate-bounce">⚠️</span>
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

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Story Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Character Summary */}
            <Card className="animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-purple-600">👥</span>
                  Selected Characters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {characters.map((character, index) => (
                    <div 
                      key={character.id}
                      className="p-3 bg-purple-50 border border-purple-200 rounded-lg animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-lg">
                            {character.species === 'animal' ? '🐾' : 
                             character.species === 'magical' ? '✨' : '👤'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-purple-800">{character.name}</h4>
                          <p className="text-xs text-purple-600">
                            {character.personalityTraits?.slice(0, 2).join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Story Content Editor */}
            <Card className="animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="text-orange-600">📝</span>
                    Story Content
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateStoryWithAI}
                      disabled={isGenerating}
                      isLoading={isGenerating}
                    >
                      {isGenerating ? 'Generating...' : '🪄 AI Generate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAnalytics(!showAnalytics)}
                    >
                      {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={storyContent}
                  onChange={(e) => setStoryContent(e.target.value)}
                  placeholder={`Start writing your ${selectedTheme} story featuring ${characters.map(c => c.name).join(', ')}...\n\nOnce upon a time, in a magical ${selectedTheme === 'fantasy' ? 'kingdom' : selectedTheme === 'space' ? 'galaxy' : 'land'}...`}
                  className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 hover:border-orange-300"
                />
                
                <div className="mt-4 flex gap-3">
                  <Button
                    onClick={saveStory}
                    disabled={isGenerating || !storyContent.trim()}
                    isLoading={isGenerating}
                    variant="gradient"
                    className="flex-1"
                  >
                    {isGenerating ? 'Saving...' : '✨ Save Story'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/stories/create')}
                    disabled={isGenerating}
                  >
                    Back to Setup
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Real-Time Analytics Panel */}
          <div className="lg:col-span-1">
            {showAnalytics && characters.length > 0 && (
              <div className="sticky top-8">
                <RealTimeAnalyticsMonitor
                  characterId={characters[0]?.id || ''}
                  storyContent={storyContent}
                  storyContext={{
                    theme: selectedTheme,
                    characters: characters,
                    moralLesson: moralLesson
                  }}
                  onAnalyticsUpdate={handleAnalyticsUpdate}
                  className="animate-slide-in"
                />
                
                {currentAnalytics && (
                  <Card className="mt-4 animate-fade-in">
                    <CardHeader>
                      <CardTitle className="text-sm">Quick Tips</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {currentAnalytics.suggestions?.slice(0, 3).map((suggestion: {
                        type: string;
                        priority: string;
                        message: string;
                        details: string;
                      }, index: number) => (
                        <div 
                          key={index}
                          className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800"
                        >
                          <div className="font-medium">{suggestion.message}</div>
                          {suggestion.details && (
                            <div className="mt-1 opacity-90">{suggestion.details}</div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
