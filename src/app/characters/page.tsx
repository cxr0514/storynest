'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { ChildProfile, Character } from '@/types'

export default function CharactersLibrary() {
  const { data: session } = useSession()
  const router = useRouter()
  const [characters, setCharacters] = useState<Character[]>([])
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([])
  const [selectedChild, setSelectedChild] = useState<string>('all')
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

        // Load all characters
        const charactersResponse = await fetch('/api/characters')
        if (charactersResponse.ok) {
          const allCharacters = await charactersResponse.json()
          setCharacters(allCharacters)
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

  const filteredCharacters = characters.filter(character => 
    selectedChild === 'all' || character.childProfileId === selectedChild
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-200 via-purple-100 to-pink-200 relative overflow-hidden">
        {/* Floating decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 text-4xl animate-float opacity-20">🎭</div>
          <div className="absolute top-32 right-20 text-3xl animate-bounce-slow opacity-30">⭐</div>
          <div className="absolute bottom-40 left-16 text-4xl animate-float opacity-25">🎨</div>
          <div className="absolute bottom-32 right-24 text-3xl animate-bounce-slow opacity-20">✨</div>
        </div>
        
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 mx-auto animate-bounce-gentle shadow-lg">
                <span className="text-white text-3xl">🎭</span>
              </div>
              <p className="text-purple-700 font-medium text-lg">✨ Loading your magical characters ✨</p>
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
        <div className="absolute top-20 left-10 text-4xl animate-float opacity-20">🎭</div>
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
            🎭 Magical Character Library ✨
          </h1>
          <p className="text-purple-700 font-medium text-lg">🌟 Meet your colorful cast of consistent story characters! 🎨</p>
        </div>

        {/* Enhanced Filters with Cartoon Theme */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-xl">🔍</span>
            Find Your Characters
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

            <div className="flex items-end">
              <Button 
                onClick={() => window.location.href = '/characters/create'}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                <span className="text-lg">🎭</span>
                Create New Character
                <span className="text-lg">✨</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Characters Grid with Cartoon Theme */}
        {filteredCharacters.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 text-center shadow-lg border border-white/20">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 via-pink-500 to-orange-400 rounded-full flex items-center justify-center mb-6 mx-auto animate-bounce-gentle shadow-lg">
              <span className="text-white text-3xl">🎭</span>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-3">
              {selectedChild !== 'all' ? '🎪 No Characters for This Child Yet' : '✨ Your Character Stage Awaits! ✨'}
            </h3>
            <p className="text-purple-700 font-medium mb-8 text-lg">
              {selectedChild !== 'all' 
                ? '🌟 This little storyteller is ready to create their first character!' 
                : '🎨 Ready to bring some amazing characters to life? 🌈'}
            </p>
            <Button 
              onClick={() => window.location.href = '/characters/create'}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3 mx-auto text-lg"
            >
              <span className="text-xl">🎭</span>
              Create Your First Character
              <span className="text-xl">✨</span>
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCharacters.map((character) => {
              const childProfile = childProfiles.find(p => p.id === character.childProfileId)
              // Mock consistency score for now - in real implementation this would come from the database
              const consistencyScore = 95
              
              const typeEmojis: Record<string, string> = {
                animal: '🐾',
                human: '👤',
                magical: '✨',
                robot: '🤖',
                fairy: '🧚',
                other: '❓'
              }

              const speciesGradients: Record<string, string> = {
                animal: 'from-green-300 via-emerald-200 to-teal-300',
                human: 'from-blue-300 via-indigo-200 to-purple-300',
                magical: 'from-purple-300 via-pink-200 to-yellow-300',
                robot: 'from-gray-300 via-blue-200 to-cyan-300',
                fairy: 'from-pink-300 via-purple-200 to-indigo-300',
                other: 'from-orange-300 via-yellow-200 to-red-300'
              }

              return (
                <div key={character.id} className="bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-white/20 hover:shadow-xl transform hover:scale-105 transition-all duration-300 group">
                  {/* Enhanced Character Avatar */}
                  <div className={`h-36 bg-gradient-to-br ${speciesGradients[character.species] || 'from-purple-200 via-blue-200 to-pink-200'} flex items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-2 left-3 text-2xl animate-float">⭐</div>
                      <div className="absolute bottom-3 right-2 text-xl animate-bounce-slow">✨</div>
                      <div className="absolute top-4 right-4 text-lg animate-float-delayed">🌟</div>
                    </div>
                    
                    {/* Show generated avatar if available, fallback to emoji */}
                    {character.avatarUrl ? (
                      <img 
                        src={character.avatarUrl} 
                        alt={`${character.name} avatar`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          // Fallback to emoji if image fails to load
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    
                    <span className={`text-5xl group-hover:animate-bounce-gentle transition-all duration-300 ${character.avatarUrl ? 'hidden' : ''}`}>
                      {typeEmojis[character.species] || '👤'}
                    </span>
                    
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      <span className={`${consistencyScore >= 95 ? 'text-green-600' : consistencyScore >= 85 ? 'text-orange-600' : 'text-red-600'}`}>
                        {consistencyScore}% ✨
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-purple-700 transition-colors">
                        {character.name}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p className="text-purple-600 font-medium flex items-center gap-1 capitalize">
                          <span>{typeEmojis[character.species]}</span>
                          {character.species} • 🎤 {character.speakingStyle} voice
                        </p>
                        {childProfile && (
                          <p className="text-blue-600 font-medium flex items-center gap-1">
                            <span>👧👦</span>
                            Created by {childProfile.name}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {character.personalityTraits.slice(0, 3).map((trait) => (
                            <span 
                              key={trait}
                              className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-2 py-1 rounded-full border border-purple-200"
                            >
                              {trait}
                            </span>
                          ))}
                          {character.personalityTraits.length > 3 && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              +{character.personalityTraits.length - 3} more ✨
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2 italic">
                      {character.personalityDescription}
                    </p>
                    
                    {character.favoritePhrases.length > 0 && (
                      <p className="text-xs italic text-purple-600 bg-purple-50 p-2 rounded-lg border border-purple-100">
                        &ldquo;{character.favoritePhrases[0]}&rdquo;
                      </p>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                        onClick={() => {
                          // TODO: Navigate to character details/edit page
                          alert('Character details page coming soon!')
                        }}
                      >
                        👁️ View Details
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="px-3 hover:bg-purple-100 rounded-xl transition-all duration-200"
                        onClick={() => {
                          // TODO: Character options (edit, delete, use in story)
                          alert('Character options coming soon!')
                        }}
                      >
                        <span className="text-lg">⋯</span>
                      </Button>
                    </div>

                    {/* Enhanced Consistency Score Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-purple-600 font-medium">
                        <span className="flex items-center gap-1">
                          <span>🎯</span> Consistency Score
                        </span>
                        <span>{consistencyScore}%</span>
                      </div>
                      <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-3 shadow-inner">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 shadow-md relative overflow-hidden ${
                            consistencyScore >= 95 ? 'bg-gradient-to-r from-green-400 via-emerald-500 to-green-600' :
                            consistencyScore >= 85 ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500' :
                            'bg-gradient-to-r from-red-400 via-pink-500 to-red-600'
                          }`}
                          style={{ width: `${consistencyScore}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Enhanced Quick Stats with Cartoon Theme */}
        {filteredCharacters.length > 0 && (
          <div className="mt-12 grid md:grid-cols-4 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/20 hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-4 mx-auto animate-bounce-gentle shadow-lg">
                <span className="text-white text-2xl">🎭</span>
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
                {filteredCharacters.length}
              </div>
              <p className="text-purple-700 font-medium">✨ Total Characters ✨</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/20 hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mb-4 mx-auto animate-bounce-gentle shadow-lg">
                <span className="text-white text-2xl">🐾</span>
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
                {filteredCharacters.filter(c => c.species === 'animal').length}
              </div>
              <p className="text-purple-700 font-medium">🌟 Animal Friends 🌟</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/20 hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4 mx-auto animate-bounce-gentle shadow-lg">
                <span className="text-white text-2xl">🎯</span>
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent mb-2">
                95%
              </div>
              <p className="text-purple-700 font-medium">🏆 Avg. Consistency 🏆</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/20 hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mb-4 mx-auto animate-bounce-gentle shadow-lg">
                <span className="text-white text-2xl">💫</span>
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-2">
                {new Set(filteredCharacters.flatMap(c => c.personalityTraits)).size}
              </div>
              <p className="text-purple-700 font-medium">🎨 Unique Traits 🎨</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
