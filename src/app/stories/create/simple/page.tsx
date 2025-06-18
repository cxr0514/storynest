'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ChildProfile } from '@/types'

export default function SimplifiedCreateStory() {
  const router = useRouter()
  const { data: session } = useSession()
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedChild, setSelectedChild] = useState('')
  const [selectedTheme, setSelectedTheme] = useState('')

  console.log('🔍 Simplified form - Session:', session)
  console.log('🔍 Simplified form - Loading:', isLoading)
  console.log('🔍 Simplified form - Child Profiles:', childProfiles)

  // Redirect if not authenticated
  useEffect(() => {
    if (!session && typeof window !== 'undefined') {
      console.log('🚫 Not authenticated, redirecting...')
      router.push('/auth/signin')
      return
    }
  }, [session, router])

  useEffect(() => {
    const loadChildProfiles = async () => {
      try {
        console.log('📡 Fetching child profiles...')
        const response = await fetch('/api/child-profiles')
        console.log('📡 Child profiles response:', response.status)
        
        if (response.ok) {
          const profiles = await response.json()
          console.log('✅ Child profiles loaded:', profiles)
          setChildProfiles(profiles)
          if (profiles.length > 0) {
            setSelectedChild(profiles[0].id)
          }
        } else {
          console.error('❌ Failed to fetch child profiles:', response.status)
        }
      } catch (error) {
        console.error('💥 Error loading child profiles:', error)
      } finally {
        console.log('✅ Loading complete')
        setIsLoading(false)
      }
    }

    if (session) {
      console.log('👤 User authenticated, loading data...')
      loadChildProfiles()
    } else {
      console.log('⏳ Waiting for authentication...')
    }
  }, [session])

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Create Story</h1>
          <div style={{ padding: '2rem', backgroundColor: 'white', borderRadius: '8px' }}>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Create Story - Simplified</h1>
        
        <div style={{ padding: '2rem', backgroundColor: 'white', borderRadius: '8px', marginBottom: '1rem' }}>
          <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '4px' }}>
            <strong>Debug Info:</strong> 
            <br />Session: {session ? 'Authenticated' : 'Not authenticated'}
            <br />Child Profiles: {childProfiles.length}
            <br />Selected Child: {selectedChild}
            <br />Selected Theme: {selectedTheme}
          </div>
          
          <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Child Profile Selection */}
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                Select Child Profile
              </label>
              {childProfiles.length === 0 ? (
                <div style={{ padding: '1rem', border: '2px dashed #d1d5db', textAlign: 'center', borderRadius: '8px' }}>
                  <p>No child profiles found. Create one first!</p>
                  <button 
                    type="button"
                    onClick={() => router.push('/dashboard')}
                    style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Go to Dashboard
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {childProfiles.map((profile) => (
                    <div 
                      key={profile.id}
                      style={{ 
                        padding: '1rem', 
                        border: selectedChild === profile.id ? '2px solid #f97316' : '1px solid #d1d5db',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: selectedChild === profile.id ? '#fff7ed' : 'white'
                      }}
                      onClick={() => {
                        console.log('Child selected:', profile.id)
                        setSelectedChild(profile.id)
                      }}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ 
                          width: '3rem', 
                          height: '3rem', 
                          backgroundColor: '#f97316', 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          margin: '0 auto 0.5rem',
                          color: 'white',
                          fontWeight: 'bold'
                        }}>
                          {profile.name[0]}
                        </div>
                        <p style={{ fontWeight: '500' }}>{profile.name} ({profile.age})</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Story Theme */}
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                Story Theme
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
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
                    type="button"
                    style={{
                      padding: '1rem',
                      border: selectedTheme === themeOption.theme ? '2px solid #f97316' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      backgroundColor: selectedTheme === themeOption.theme ? '#fff7ed' : 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onClick={() => {
                      console.log('Theme selected:', themeOption.theme)
                      setSelectedTheme(themeOption.theme)
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{themeOption.emoji}</span>
                    <span style={{ fontSize: '0.875rem' }}>{themeOption.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem' }}>
              <button 
                type="button"
                onClick={() => router.push('/dashboard')}
                style={{ 
                  flex: '1', 
                  padding: '0.75rem', 
                  border: '1px solid #d1d5db', 
                  backgroundColor: 'white', 
                  borderRadius: '8px', 
                  cursor: 'pointer' 
                }}
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={() => {
                  console.log('Create story clicked:', { selectedChild, selectedTheme })
                  alert(`Would create story with child: ${selectedChild}, theme: ${selectedTheme}`)
                }}
                disabled={!selectedChild || !selectedTheme}
                style={{ 
                  flex: '1', 
                  padding: '0.75rem', 
                  backgroundColor: (!selectedChild || !selectedTheme) ? '#9ca3af' : '#f97316', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: (!selectedChild || !selectedTheme) ? 'not-allowed' : 'pointer' 
                }}
              >
                Create Story
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
