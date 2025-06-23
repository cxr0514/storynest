'use client'

import { useState } from 'react'

// Inline Luna Dragon Generator Component to avoid import issues
function LunaDragonGenerator() {
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [error, setError] = useState('')

  async function handleGenerate() {
    setLoading(true)
    setError('')
    console.log('🐉 Generating Luna dragon image...')

    try {
      // Luna character prompt - exactly like our AI utilities would generate
      const lunaPrompt = `# ClaudePrompt
task: Generate illustration prompt
style: Children's book illustration
character:
  name: Luna
  species: Dragon
  traits:
    - purple scales
    - silver belly
    - glowing green eyes
    - tiny wings
scene:
  location: Behind the waterfall in the Enchanted Forest
  action: Luna flies up toward glowing cave runes
  lighting: soft magical glow
format: digital painting
quality: high detail
mood: whimsical and magical`

      console.log('🎨 Generated prompt:', lunaPrompt)

      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: lunaPrompt }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate image')
      }

      setImageUrl(data.imageUrl)
      console.log('✅ Luna dragon image generated successfully!')
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('❌ Image generation error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleGenerate}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        disabled={loading}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            Generating Luna...
          </>
        ) : (
          <>
            🎨 Generate Luna Dragon Image
          </>
        )}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">❌ {error}</p>
        </div>
      )}

      {imageUrl && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm">✅ Successfully generated Luna dragon image!</p>
          </div>
          
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-lg">
            <img
              src={imageUrl}
              alt="Luna the Dragon - purple scales, silver belly, glowing green eyes, tiny wings"
              className="w-full h-auto"
              onLoad={() => console.log('🖼️ Image loaded successfully')}
              onError={() => {
                setError('Failed to load generated image')
                console.error('❌ Image failed to load')
              }}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">🎯 Character Details:</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• <strong>Name:</strong> Luna</li>
              <li>• <strong>Species:</strong> Dragon</li>
              <li>• <strong>Traits:</strong> Purple scales, silver belly, glowing green eyes, tiny wings</li>
              <li>• <strong>Scene:</strong> Flying toward glowing cave runes behind waterfall</li>
              <li>• <strong>Location:</strong> Enchanted Forest</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TestImageGeneration() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-green-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              🎨 AI Prompt Utilities Demo
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Testing Luna Dragon Character Generation
            </p>
            <p className="text-gray-500">
              This demonstrates the AI prompt utilities integration with StorynestAI
            </p>
          </div>

          {/* Luna Character Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="text-6xl">🐉</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Luna the Dragon</h2>
                <p className="text-gray-600">Our test character for consistent AI generation</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Character Traits</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Purple scales with iridescent shimmer
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                    Silver belly marking
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Glowing green eyes
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Tiny, delicate wings (fairy-like)
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Scene Details</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    Location: Behind waterfall in Enchanted Forest
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    Action: Flying toward glowing cave runes
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                    Style: Children&apos;s book illustration
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    Mood: Magical and enchanting
                  </li>
                </ul>
              </div>
            </div>

            {/* Generate Button Component */}
            <LunaDragonGenerator />
          </div>

          {/* Feature Overview */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              🚀 AI Prompt Utilities Features
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="text-3xl mb-3">📝</div>
                <h3 className="font-semibold text-gray-800 mb-2">Structured Prompts</h3>
                <p className="text-sm text-gray-600">
                  YAML-formatted prompts with character traits, scene details, and style preferences
                </p>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-3xl mb-3">🎭</div>
                <h3 className="font-semibold text-gray-800 mb-2">Character Consistency</h3>
                <p className="text-sm text-gray-600">
                  Maintains Luna&apos;s purple scales, tiny wings, and other traits across all images
                </p>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-3xl mb-3">🔗</div>
                <h3 className="font-semibold text-gray-800 mb-2">StorynestAI Integration</h3>
                <p className="text-sm text-gray-600">
                  Seamlessly works with existing story creation and character systems
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
