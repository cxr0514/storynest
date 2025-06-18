'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useSubscription } from '@/hooks/useSubscription'
import { ChildProfileModal } from '@/components/child-profile-modal'

interface ChildProfile {
  id: string
  name: string
  age: number
}

interface CharacterFormData {
  name: string
  species: string
  age: string
  physicalFeatures: string
  clothingAccessories: string
  personalityTraits: string
  personalityDescription: string
  specialAbilities: string
  favoriteThings: string
  speakingStyle: string
  favoritePhrases: string
  childProfileId: string
  backstory: string
  goals: string
  quirks: string
  catchphrase: string
}

const initialFormData: CharacterFormData = {
  name: '',
  species: '',
  age: '',
  physicalFeatures: '',
  clothingAccessories: '',
  personalityTraits: '',
  personalityDescription: '',
  specialAbilities: '',
  favoriteThings: '',
  speakingStyle: '',
  favoritePhrases: '',
  childProfileId: '',
  backstory: '',
  goals: '',
  quirks: '',
  catchphrase: ''
}

const characterTypes = [
  { value: 'human', emoji: '👤', label: 'Human', description: 'A regular person with unique traits' },
  { value: 'animal', emoji: '🐾', label: 'Animal', description: 'A talking animal friend' },
  { value: 'fantasy', emoji: '🧙‍♂️', label: 'Fantasy', description: 'Magical creatures like wizards, fairies, or dragons' },
  { value: 'robot', emoji: '🤖', label: 'Robot', description: 'A friendly mechanical companion' },
  { value: 'superhero', emoji: '🦸‍♀️', label: 'Superhero', description: 'A hero with special powers' },
  { value: 'alien', emoji: '👽', label: 'Alien', description: 'A friendly visitor from space' }
]

const validateForm = (data: CharacterFormData): string[] => {
  const errors: string[] = []
  
  if (!data.name.trim()) errors.push('Character name is required')
  if (!data.species.trim()) errors.push('Character type is required')
  if (!data.personalityTraits.trim()) errors.push('Personality traits are required')
  if (!data.childProfileId.trim()) errors.push('Child profile selection is required')
  
  // Ensure age and physicalFeatures have values (with defaults)
  if (!data.age.trim() && !data.physicalFeatures.trim()) {
    errors.push('Either age or physical features should be specified')
  }
  
  return errors
}

export default function CreateCharacterPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { subscription } = useSubscription()
  
  const [formData, setFormData] = useState<CharacterFormData>(initialFormData)
  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [showChildProfileModal, setShowChildProfileModal] = useState(false)
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([])

  const isCharacterLimitReached = subscription && subscription.usage.charactersLimit !== -1 
    ? (subscription.usage.charactersCount || 0) >= (subscription.usage.charactersLimit || 0)
    : false

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }
    
    fetchChildProfiles()
  }, [session, router])

  // Effect to handle child pre-selection from query params
  useEffect(() => {
    const preSelectedChildId = searchParams.get('childId')
    if (preSelectedChildId && childProfiles.length > 0) {
      const targetChildExists = childProfiles.find((profile: ChildProfile) => profile.id === preSelectedChildId)
      if (targetChildExists) {
        setFormData(prev => ({ ...prev, childProfileId: preSelectedChildId }))
      }
    } else if (childProfiles.length > 0 && !formData.childProfileId) {
      // Set default to first child if no pre-selection and no current selection
      setFormData(prev => ({ ...prev, childProfileId: childProfiles[0].id }))
    }
  }, [childProfiles, searchParams, formData.childProfileId])

  const fetchChildProfiles = async () => {
    try {
      const response = await fetch('/api/child-profiles')
      if (response.ok) {
        const profiles = await response.json()
        setChildProfiles(profiles)
      }
    } catch (error) {
      console.error('Error fetching child profiles:', error)
    }
  }

  const handleInputChange = (field: keyof CharacterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear related errors when user starts typing
    if (errors.length > 0) {
      setErrors([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationErrors = validateForm(formData)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    if (isCharacterLimitReached) {
      setErrors(['Character creation limit reached. Please upgrade your plan to create more characters.'])
      return
    }

    setIsSubmitting(true)
    setErrors([])

    try {
      // Map form data to API expected format
      const characterData = {
        ...formData,
        personalityDescription: formData.personalityTraits, // API expects personalityDescription
        personalityTraits: formData.personalityTraits.split(',').map(trait => trait.trim()).filter(Boolean),
        favoritePhrases: formData.favoritePhrases.split(',').map(phrase => phrase.trim()).filter(Boolean),
        ageGroups: ['3-6', '7-10'],
        appearances: [],
        // Ensure required fields have fallback values
        age: formData.age || 'Unknown',
        physicalFeatures: formData.physicalFeatures || 'Not specified'
      }

      console.log('Sending character data:', characterData)

      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(characterData)
      })

      if (response.ok) {
        router.push('/characters')
      } else {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        setErrors([errorData.error || errorData.message || 'Failed to create character'])
      }
    } catch (error) {
      console.error('Error creating character:', error)
      setErrors(['An error occurred while creating the character'])
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChildProfileSuccess = () => {
    setShowChildProfileModal(false)
    fetchChildProfiles()
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-4xl">🎭</span>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Create Your Character
            </h1>
            <span className="text-4xl">✨</span>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Bring your imagination to life! Create a unique character that will star in amazing stories.
          </p>
          
          {/* Character Limit Status */}
          {subscription && subscription.usage.charactersLimit !== -1 && (
            <div className="mt-6 max-w-md mx-auto">
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Characters Created</span>
                  <Badge variant={isCharacterLimitReached ? "destructive" : "default"}>
                    {subscription.usage.charactersCount} / {subscription.usage.charactersLimit}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isCharacterLimitReached ? 'bg-red-500' : 'bg-gradient-to-r from-purple-500 to-blue-500'
                    }`}
                    style={{ 
                      width: `${Math.min(((subscription.usage.charactersCount || 0) / (subscription.usage.charactersLimit || 1)) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-red-700">{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Child Profile Selection */}
        {childProfiles.length === 0 ? (
          <Card className="mb-6 bg-white shadow-lg border-0">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <span className="text-2xl">👶</span>
                No Child Profiles Found
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Create a child profile first to personalize the character for your little one.
              </p>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                onClick={() => setShowChildProfileModal(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Create Child Profile
              </Button>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Child Profile Selection */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">👶</span>
                  Select Child Profile
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  Choose which child this character is for, or create a new profile.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={formData.childProfileId}
                    onChange={(e) => handleInputChange('childProfileId', e.target.value)}
                    required
                  >
                    <option value="">Select a child profile...</option>
                    {childProfiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.name} (Age {profile.age})
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowChildProfileModal(true)}
                  className="w-full"
                >
                  Create New Child Profile
                </Button>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📝</span>
                  Basic Information
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  Let&apos;s start with the basics about your character.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Character Name *
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Luna the Brave"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., 8 years old, or Ancient"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Character Type *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {characterTypes.map((type) => (
                      <label
                        key={type.value}
                        className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.species === type.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="species"
                          value={type.value}
                          checked={formData.species === type.value}
                          onChange={(e) => handleInputChange('species', e.target.value)}
                          className="sr-only"
                        />
                        <span className="text-2xl mb-2">{type.emoji}</span>
                        <span className="font-medium text-center">{type.label}</span>
                        <span className="text-xs text-gray-500 text-center mt-1">{type.description}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">👁️</span>
                  Appearance
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  Describe what your character looks like.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Physical Features
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-24 resize-none"
                    placeholder="e.g., Bright blue eyes, curly golden hair, tall and graceful..."
                    value={formData.physicalFeatures}
                    onChange={(e) => handleInputChange('physicalFeatures', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clothing & Accessories
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-24 resize-none"
                    placeholder="e.g., A shimmering purple cape, silver crown, magical boots..."
                    value={formData.clothingAccessories}
                    onChange={(e) => handleInputChange('clothingAccessories', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Personality */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">💝</span>
                  Personality
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  What makes your character special and unique?
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Personality Traits *
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-24 resize-none"
                    placeholder="e.g., Brave, kind, curious, always ready to help friends..."
                    value={formData.personalityTraits}
                    onChange={(e) => handleInputChange('personalityTraits', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Favorite Things
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-24 resize-none"
                    placeholder="e.g., Loves strawberry ice cream, collecting shiny rocks, singing songs..."
                    value={formData.favoriteThings}
                    onChange={(e) => handleInputChange('favoriteThings', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Abilities
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-24 resize-none"
                    placeholder="e.g., Can talk to animals, flies on a magic carpet, super strength..."
                    value={formData.specialAbilities}
                    onChange={(e) => handleInputChange('specialAbilities', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Communication Style */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">💬</span>
                  Communication Style
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  How does your character talk and express themselves?
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Speaking Style
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-24 resize-none"
                    placeholder="e.g., Speaks in rhymes, uses old-fashioned words, talks very excitedly..."
                    value={formData.speakingStyle}
                    onChange={(e) => handleInputChange('speakingStyle', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Favorite Phrases
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-24 resize-none"
                    placeholder="e.g., Let us go on an adventure!, That is magical!"
                    value={formData.favoritePhrases}
                    onChange={(e) => handleInputChange('favoritePhrases', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Advanced Options Toggle */}
            <div className="text-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="text-purple-600 border-purple-600 hover:bg-purple-50"
              >
                {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
              </Button>
            </div>

            {/* Advanced Options */}
            {showAdvancedOptions && (
              <Card className="bg-white shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">⚙️</span>
                    Advanced Options
                  </CardTitle>
                  <p className="text-gray-600 mt-2">
                    Add more depth to your character with these optional details.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Backstory
                    </label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-32 resize-none"
                      placeholder="e.g., Born in a magical kingdom, found as a baby by forest animals..."
                      value={formData.backstory}
                      onChange={(e) => handleInputChange('backstory', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Goals & Dreams
                    </label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-24 resize-none"
                      placeholder="e.g., Wants to become the greatest explorer, hopes to find the lost treasure..."
                      value={formData.goals}
                      onChange={(e) => handleInputChange('goals', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quirks & Habits
                      </label>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-24 resize-none"
                        placeholder="e.g., Always hums while walking, collects buttons..."
                        value={formData.quirks}
                        onChange={(e) => handleInputChange('quirks', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Catchphrase
                      </label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g., Adventure awaits!"
                        value={formData.catchphrase}
                        onChange={(e) => handleInputChange('catchphrase', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/characters')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isCharacterLimitReached}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating Character...
                  </div>
                ) : (
                  'Create Character ✨'
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Child Profile Modal */}
        {showChildProfileModal && (
          <ChildProfileModal
            isOpen={showChildProfileModal}
            onClose={() => setShowChildProfileModal(false)}
            onSuccess={handleChildProfileSuccess}
          />
        )}
      </main>
    </div>
  )
}
