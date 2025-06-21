'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'

interface Character {
  id: string
  name: string
  species: string
  age: string
  physicalFeatures: string
  clothingAccessories: string
  personalityTraits: string[]
  personalityDescription: string
  specialAbilities: string
  favoriteThings: string
  speakingStyle: string
  favoritePhrases: string[]
  ChildProfile: {
    id: string
    name: string
  }
  createdAt: string
}

export default function CharacterDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [character, setCharacter] = useState<Character | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const characterId = params.id as string

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    const loadCharacter = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/characters/${characterId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Character not found')
          } else {
            setError('Failed to load character')
          }
          return
        }

        const characterData = await response.json()
        setCharacter(characterData)
      } catch (err) {
        setError('Failed to load character')
        console.error('Error loading character:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (characterId) {
      loadCharacter()
    }
  }, [session, router, characterId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Loading character...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !character) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              {error || 'Character not found'}
            </h1>
            <p className="text-gray-600 mb-6">
              The character you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
            </p>
            <Button onClick={() => router.push('/characters')}>
              Back to Characters
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/characters')}
            >
              ← Back to Characters
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{character.name}</h1>
              <p className="text-gray-600">Created for {character.ChildProfile.name}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => router.push(`/characters/${character.id}/edit`)}
            >
              Edit Character
            </Button>
            <Button onClick={() => router.push('/stories/create')}>
              Create Story
            </Button>
          </div>
        </div>

        {/* Character Details */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600">Species</label>
                <p className="text-gray-800">{character.species}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600">Age</label>
                <p className="text-gray-800">{character.age}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600">Physical Features</label>
                <p className="text-gray-800">{character.physicalFeatures}</p>
              </div>
              {character.clothingAccessories && (
                <div>
                  <label className="block text-sm font-semibold text-gray-600">Clothing & Accessories</label>
                  <p className="text-gray-800">{character.clothingAccessories}</p>
                </div>
              )}
            </div>
          </div>

          {/* Personality */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Personality</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600">Description</label>
                <p className="text-gray-800">{character.personalityDescription}</p>
              </div>
              {character.personalityTraits.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-600">Traits</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {character.personalityTraits.map((trait, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {character.speakingStyle && (
                <div>
                  <label className="block text-sm font-semibold text-gray-600">Speaking Style</label>
                  <p className="text-gray-800">{character.speakingStyle}</p>
                </div>
              )}
            </div>
          </div>

          {/* Special Details */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Special Details</h2>
            <div className="space-y-4">
              {character.specialAbilities && (
                <div>
                  <label className="block text-sm font-semibold text-gray-600">Special Abilities</label>
                  <p className="text-gray-800">{character.specialAbilities}</p>
                </div>
              )}
              {character.favoriteThings && (
                <div>
                  <label className="block text-sm font-semibold text-gray-600">Favorite Things</label>
                  <p className="text-gray-800">{character.favoriteThings}</p>
                </div>
              )}
              {character.favoritePhrases.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-600">Favorite Phrases</label>
                  <div className="space-y-1">
                    {character.favoritePhrases.map((phrase, index) => (
                      <p key={index} className="text-gray-800 italic">&quot;{phrase}&quot;</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Actions</h2>
            <div className="space-y-3">
              <Button 
                className="w-full"
                onClick={() => router.push(`/stories/create?character=${character.id}`)}
              >
                Create a Story with {character.name}
              </Button>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/characters/${character.id}/edit`)}
              >
                Edit Character Details
              </Button>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => router.push('/characters')}
              >
                View All Characters
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
