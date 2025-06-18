'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

// Simplified types
interface ChildProfile {
  id: string
  name: string
  age: number
  interests: string[]
}

interface Character {
  id: string
  name: string
  species: string
  personalityDescription: string
  personalityTraits: string[]
}

export default function CreateStoryFixed() {
  const router = useRouter()
  const { data: session, status } = useSession()
  
  // State management
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([])
  const [availableCharacters, setAvailableCharacters] = useState<Character[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Form state
  const [selectedChild, setSelectedChild] = useState<string>('')
  const [selectedTheme, setSelectedTheme] = useState<string>('')
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([])

  console.log('🔍 CreateStoryFixed - Status:', status, 'Session:', !!session)

  // Authentication check
  useEffect(() => {
    if (status === 'loading') return // Still loading
    
    if (status === 'unauthenticated') {
      console.log('🚫 Not authenticated, redirecting...')
      router.push('/auth/signin')
      return
    }
    
    if (status === 'authenticated' && session) {
      console.log('✅ Authenticated, loading data...')
      loadData()
    }
  }, [status, session, router])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('📡 Loading child profiles...')
      const profilesResponse = await fetch('/api/child-profiles')
      
      if (!profilesResponse.ok) {
        throw new Error(`Failed to load profiles: ${profilesResponse.status}`)
      }
      
      const profiles = await profilesResponse.json()
      console.log('✅ Profiles loaded:', profiles.length)
      setChildProfiles(profiles)
      
      if (profiles.length > 0) {
        setSelectedChild(profiles[0].id)
        
        // Load characters for first child
        console.log('📡 Loading characters...')
        const charactersResponse = await fetch(`/api/characters?childProfileId=${profiles[0].id}`)
        
        if (charactersResponse.ok) {
          const characters = await charactersResponse.json()
          console.log('✅ Characters loaded:', characters.length)
          setAvailableCharacters(characters)
        }
      }
    } catch (err) {
      console.error('❌ Error loading data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateStory = async () => {
    if (!selectedChild || !selectedTheme || selectedCharacters.length === 0) {
      alert('Please select a child, theme, and at least one character')
      return
    }

    try {
      setIsGenerating(true)
      
      console.log('🎯 Creating story...', {
        theme: selectedTheme,
        characterIds: selectedCharacters,
        childProfileId: selectedChild
      })

      const response = await fetch('/api/stories/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: selectedTheme,
          characterIds: selectedCharacters,
          childProfileId: selectedChild
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create story')
      }

      const data = await response.json()
      console.log('✅ Story created:', data)
      
      if (data.story?.id) {
        router.push(`/stories/${data.story.id}`)
      } else {
        throw new Error('Invalid response: missing story ID')
      }
    } catch (err) {
      console.error('❌ Story creation error:', err)
      alert(err instanceof Error ? err.message : 'Failed to create story')
    } finally {
      setIsGenerating(false)
    }
  }

  // Loading state
  if (status === 'loading' || isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '2rem',
            marginBottom: '1rem'
          }}>📚</div>
          <p>Loading story creation...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ 
          textAlign: 'center',
          padding: '2rem',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          maxWidth: '500px'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ color: '#dc3545', marginBottom: '1rem' }}>Error Loading Page</h2>
          <p style={{ marginBottom: '1.5rem' }}>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '1rem'
            }}
          >
            Retry
          </button>
          <button 
            onClick={() => router.push('/dashboard')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fa',
      padding: '2rem 1rem'
    }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '2rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          marginBottom: '0.5rem',
          color: '#333'
        }}>
          📚 Create a Magical Story ✨
        </h1>
        <p style={{ 
          color: '#666', 
          marginBottom: '2rem' 
        }}>
          Tell us about your story and we'll create an amazing adventure!
        </p>

        {/* Child Profile Selection */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Select Child Profile</h3>
          {childProfiles.length === 0 ? (
            <div style={{ 
              padding: '2rem', 
              border: '2px dashed #ddd',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <p style={{ marginBottom: '1rem' }}>No child profiles found. Create one first!</p>
              <button 
                onClick={() => router.push('/dashboard')}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {childProfiles.map((profile) => (
                <div 
                  key={profile.id}
                  onClick={() => setSelectedChild(profile.id)}
                  style={{
                    padding: '1rem',
                    border: selectedChild === profile.id ? '2px solid #007bff' : '1px solid #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: selectedChild === profile.id ? '#f0f8ff' : 'white',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ 
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '50%',
                    backgroundColor: '#007bff',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.5rem',
                    fontSize: '1.2rem',
                    fontWeight: 'bold'
                  }}>
                    {profile.name[0]}
                  </div>
                  <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                    {profile.name} ({profile.age})
                  </p>
                  <p style={{ fontSize: '0.9rem', color: '#666' }}>
                    {profile.interests?.slice(0, 2).join(', ')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Theme Selection */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Story Theme</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '1rem'
          }}>
            {[
              { theme: 'fantasy', emoji: '🏰', label: 'Fantasy' },
              { theme: 'space', emoji: '🚀', label: 'Space' },
              { theme: 'ocean', emoji: '🌊', label: 'Ocean' },
              { theme: 'magic', emoji: '🦄', label: 'Magic' },
              { theme: 'adventure', emoji: '🏝️', label: 'Adventure' },
              { theme: 'circus', emoji: '🎪', label: 'Circus' }
            ].map((themeOption) => (
              <button
                key={themeOption.theme}
                onClick={() => setSelectedTheme(themeOption.theme)}
                style={{
                  padding: '1rem',
                  border: selectedTheme === themeOption.theme ? '2px solid #007bff' : '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: selectedTheme === themeOption.theme ? '#f0f8ff' : 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>{themeOption.emoji}</span>
                <span style={{ fontSize: '0.9rem' }}>{themeOption.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Character Selection */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Choose Characters (max 3)</h3>
          {availableCharacters.length === 0 ? (
            <div style={{ 
              padding: '2rem', 
              border: '2px dashed #ddd',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <p style={{ marginBottom: '1rem' }}>No characters found for this child.</p>
              <button 
                onClick={() => router.push('/characters/create')}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Create Your First Character
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {availableCharacters.map((character) => (
                <label 
                  key={character.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1rem',
                    border: selectedCharacters.includes(character.id) ? '2px solid #007bff' : '1px solid #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: selectedCharacters.includes(character.id) ? '#f0f8ff' : 'white'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedCharacters.includes(character.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        if (selectedCharacters.length < 3) {
                          setSelectedCharacters([...selectedCharacters, character.id])
                        }
                      } else {
                        setSelectedCharacters(selectedCharacters.filter(id => id !== character.id))
                      }
                    }}
                    style={{ marginRight: '1rem' }}
                  />
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold' }}>
                      {character.name}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                      {character.personalityDescription}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem',
          justifyContent: 'flex-end'
        }}>
          <button 
            onClick={() => router.push('/dashboard')}
            disabled={isGenerating}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              opacity: isGenerating ? 0.6 : 1
            }}
          >
            Cancel
          </button>
          <button 
            onClick={handleCreateStory}
            disabled={isGenerating || !selectedChild || !selectedTheme || selectedCharacters.length === 0}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (isGenerating || !selectedChild || !selectedTheme || selectedCharacters.length === 0) ? 'not-allowed' : 'pointer',
              opacity: (isGenerating || !selectedChild || !selectedTheme || selectedCharacters.length === 0) ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {isGenerating ? (
              <>
                <span style={{ 
                  display: 'inline-block',
                  width: '1rem',
                  height: '1rem',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></span>
                Creating...
              </>
            ) : (
              <>✨ Create Story</>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
