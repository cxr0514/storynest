'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { characterFormAnimations, microAnimations } from '@/lib/animations'

interface ChildProfile {
  id: string
  name: string
  age: number
}

interface AdvancedCharacterFormData {
  selectedTraits?: string[]
  dominantMood?: string
  personalityDescription?: string
  backstory?: string
  goals?: string
  fears?: string
  specialMemories?: string
  relationships?: string
  bestFriendType?: string
  friendshipStyle?: string
  visualStyle?: string
  colorPreferences?: string
  signatureElements?: string
  developmentArc?: string
  storyRole?: string
  complexityLevel?: number
  moralCompass?: string
  [key: string]: unknown
}

interface AdvancedCharacterFormProps {
  formData: AdvancedCharacterFormData
  onUpdate: (field: string, value: unknown) => void
  childProfiles: ChildProfile[]
}

export function AdvancedCharacterForm({ formData, onUpdate }: AdvancedCharacterFormProps) {
  const [activeTab, setActiveTab] = useState('personality')

  const personalityTraits = [
    'brave', 'kind', 'curious', 'funny', 'wise', 'gentle', 'adventurous', 'creative',
    'helpful', 'loyal', 'playful', 'mysterious', 'energetic', 'calm', 'clever', 'caring'
  ]

  const emotionalStates = [
    { emoji: '😊', label: 'Happy', value: 'happy' },
    { emoji: '🤔', label: 'Thoughtful', value: 'thoughtful' },
    { emoji: '😌', label: 'Calm', value: 'calm' },
    { emoji: '⚡', label: 'Energetic', value: 'energetic' },
    { emoji: '💭', label: 'Dreamy', value: 'dreamy' },
    { emoji: '🔥', label: 'Passionate', value: 'passionate' }
  ]

  const visualStyles = [
    { name: 'Cartoon Style', value: 'cartoon', description: 'Friendly and colorful' },
    { name: 'Watercolor', value: 'watercolor', description: 'Soft and artistic' },
    { name: 'Digital Art', value: 'digital', description: 'Modern and vibrant' },
    { name: 'Hand-drawn', value: 'sketch', description: 'Personal and warm' }
  ]

  const toggleTrait = (trait: string) => {
    const currentTraits = formData.selectedTraits || []
    const updatedTraits = currentTraits.includes(trait)
      ? currentTraits.filter((t: string) => t !== trait)
      : [...currentTraits, trait]
    onUpdate('selectedTraits', updatedTraits)
  }

  const tabs = [
    { id: 'personality', label: '🎭 Personality', icon: '🎭' },
    { id: 'backstory', label: '📖 Backstory', icon: '📖' },
    { id: 'relationships', label: '👥 Relationships', icon: '👥' },
    { id: 'visual', label: '🎨 Visual Style', icon: '🎨' },
    { id: 'advanced', label: '⚙️ Advanced', icon: '⚙️' }
  ]

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "primary" : "outline"}
            onClick={() => setActiveTab(tab.id)}
            className="whitespace-nowrap min-w-fit"
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      <Card className={characterFormAnimations.tabSlide}>
        <CardContent className="p-6">
          {activeTab === 'personality' && (
            <div className={`space-y-6 ${characterFormAnimations.formSection} ${characterFormAnimations.formSectionActive}`}>
              <div>
                <h3 className="text-lg font-semibold mb-4">Personality Traits</h3>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {personalityTraits.map((trait, index) => (
                    <Badge
                      key={trait}
                      variant={formData.selectedTraits?.includes(trait) ? "default" : "outline"}
                      className={`cursor-pointer text-center justify-center py-2 ${
                        formData.selectedTraits?.includes(trait) 
                          ? `${characterFormAnimations.traitSelected} ${microAnimations.buttonPress}` 
                          : `${characterFormAnimations.traitSelect} ${microAnimations.tagSelect}`
                      } delay-[${index * 50}ms]`}
                      onClick={() => toggleTrait(trait)}
                    >
                      {trait}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Select 3-5 traits that best describe your character
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Emotional Tendencies</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {emotionalStates.map((emotion) => (
                    <div
                      key={emotion.value}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.dominantMood === emotion.value
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => onUpdate('dominantMood', emotion.value)}
                    >
                      <div className="text-2xl mb-1">{emotion.emoji}</div>
                      <div className="text-sm font-medium">{emotion.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Personality Description</label>
                <textarea
                  value={formData.personalityDescription || ''}
                  onChange={(e) => onUpdate('personalityDescription', e.target.value)}
                  placeholder="Describe your character's unique personality in detail..."
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'backstory' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Character Background</label>
                <textarea
                  value={formData.backstory || ''}
                  onChange={(e) => onUpdate('backstory', e.target.value)}
                  placeholder="Where does your character come from? What's their history?"
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Character Goals & Dreams</label>
                <textarea
                  value={formData.goals || ''}
                  onChange={(e) => onUpdate('goals', e.target.value)}
                  placeholder="What does your character want to achieve? What motivates them?"
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Fears & Challenges</label>
                <input
                  type="text"
                  value={formData.fears || ''}
                  onChange={(e) => onUpdate('fears', e.target.value)}
                  placeholder="What challenges does your character face?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Special Memories</label>
                <textarea
                  value={formData.specialMemories || ''}
                  onChange={(e) => onUpdate('specialMemories', e.target.value)}
                  placeholder="Important experiences that shaped your character..."
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'relationships' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Family & Friends</label>
                <textarea
                  value={formData.relationships || ''}
                  onChange={(e) => onUpdate('relationships', e.target.value)}
                  placeholder="Who are the important people/characters in your character's life?"
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Best Friend Type</label>
                <select
                  value={formData.bestFriendType || ''}
                  onChange={(e) => onUpdate('bestFriendType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Choose best friend type...</option>
                  <option value="animal">Animal friend</option>
                  <option value="human">Human friend</option>
                  <option value="magical">Magical creature</option>
                  <option value="robot">Robot companion</option>
                  <option value="nature">Nature spirit</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">How They Make Friends</label>
                <textarea
                  value={formData.friendshipStyle || ''}
                  onChange={(e) => onUpdate('friendshipStyle', e.target.value)}
                  placeholder="How does your character typically make friends and interact with others?"
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'visual' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Preferred Art Style</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {visualStyles.map((style) => (
                    <div
                      key={style.value}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        formData.visualStyle === style.value
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => onUpdate('visualStyle', style.value)}
                    >
                      <div className="font-medium">{style.name}</div>
                      <div className="text-sm text-gray-600">{style.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Color Preferences</label>
                <input
                  type="text"
                  value={formData.colorPreferences || ''}
                  onChange={(e) => onUpdate('colorPreferences', e.target.value)}
                  placeholder="What colors represent your character? (e.g., warm blues, earth tones)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Signature Style Elements</label>
                <input
                  type="text"
                  value={formData.signatureElements || ''}
                  onChange={(e) => onUpdate('signatureElements', e.target.value)}
                  placeholder="Unique visual elements that always appear with your character"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Character Development Arc</label>
                <select
                  value={formData.developmentArc || ''}
                  onChange={(e) => onUpdate('developmentArc', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Choose development focus...</option>
                  <option value="courage">Learning to be brave</option>
                  <option value="friendship">Building relationships</option>
                  <option value="wisdom">Gaining knowledge</option>
                  <option value="kindness">Developing empathy</option>
                  <option value="independence">Becoming self-reliant</option>
                  <option value="creativity">Expressing imagination</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Story Role Preference</label>
                <select
                  value={formData.storyRole || 'protagonist'}
                  onChange={(e) => onUpdate('storyRole', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="protagonist">Main character (hero)</option>
                  <option value="sidekick">Helpful companion</option>
                  <option value="mentor">Wise guide</option>
                  <option value="comic-relief">Funny friend</option>
                  <option value="mysterious">Mysterious ally</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Character Complexity Level</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.complexityLevel || 3}
                    onChange={(e) => onUpdate('complexityLevel', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm">
                    {formData.complexityLevel === 1 && "Simple"}
                    {formData.complexityLevel === 2 && "Basic"}
                    {formData.complexityLevel === 3 && "Moderate"}
                    {formData.complexityLevel === 4 && "Complex"}
                    {formData.complexityLevel === 5 && "Very Complex"}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Higher complexity creates more nuanced character behavior in stories
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Moral Compass</label>
                <textarea
                  value={formData.moralCompass || ''}
                  onChange={(e) => onUpdate('moralCompass', e.target.value)}
                  placeholder="What values and principles guide your character's decisions?"
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
