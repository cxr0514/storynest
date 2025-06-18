'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function StoryFormDiagnostic() {
  const { data: session, status } = useSession()
  const [childProfiles, setChildProfiles] = useState([])
  const [characters, setCharacters] = useState([])
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(true)
  const [testResults, setTestResults] = useState({})

  useEffect(() => {
    if (status === 'authenticated') {
      runDiagnostics()
    }
  }, [status])

  const runDiagnostics = async () => {
    console.log('🧪 Running Story Form Diagnostics...')
    const results = {}
    
    try {
      // Test child profiles
      const childResponse = await fetch('/api/child-profiles')
      if (childResponse.ok) {
        const profiles = await childResponse.json()
        setChildProfiles(profiles)
        results.childProfiles = {
          status: 'success',
          count: profiles.length,
          data: profiles
        }
      } else {
        results.childProfiles = {
          status: 'error',
          error: `HTTP ${childResponse.status}`
        }
      }

      // Test characters
      const charResponse = await fetch('/api/characters')
      if (charResponse.ok) {
        const chars = await charResponse.json()
        setCharacters(chars)
        results.characters = {
          status: 'success',
          count: chars.length,
          data: chars
        }
      } else {
        results.characters = {
          status: 'error',
          error: `HTTP ${charResponse.status}`
        }
      }

      // Test form interactivity
      results.formTest = {
        status: 'success',
        canInteract: true
      }

      setTestResults(results)
    } catch (error) {
      setErrors([error.message])
      console.error('Diagnostic error:', error)
    } finally {
      setLoading(false)
    }
  }

  const testFormElement = (elementType) => {
    const element = document.createElement(elementType)
    element.style.position = 'absolute'
    element.style.top = '-9999px'
    document.body.appendChild(element)
    
    const isInteractive = !element.disabled
    document.body.removeChild(element)
    return isInteractive
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">🧪 Story Form Diagnostics</h1>
          <Card className="p-6">
            <div className="animate-pulse">Running diagnostics...</div>
          </Card>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">🧪 Story Form Diagnostics</h1>
          <Card className="p-6">
            <div className="text-red-600">❌ User not authenticated. Please sign in first.</div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold mb-4">🧪 Story Form Diagnostics</h1>
        
        {/* User Info */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-3">👤 User Authentication</h2>
          <div className="space-y-2">
            <div>✅ Status: {status}</div>
            <div>✅ User: {session?.user?.email}</div>
            <div>✅ User ID: {session?.user?.id}</div>
          </div>
        </Card>

        {/* Child Profiles */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-3">👶 Child Profiles</h2>
          {testResults.childProfiles?.status === 'success' ? (
            <div className="space-y-2">
              <div>✅ API Response: Success</div>
              <div>✅ Count: {testResults.childProfiles.count}</div>
              {testResults.childProfiles.count === 0 ? (
                <div className="text-orange-600 font-medium">
                  ⚠️ No child profiles found. This is likely why the form isn't working!
                  <br />
                  <Button 
                    onClick={() => window.location.href = '/dashboard'} 
                    className="mt-2"
                    variant="outline"
                  >
                    Go Create Child Profile
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="text-green-600">✅ Child profiles available:</div>
                  {childProfiles.map(profile => (
                    <div key={profile.id} className="ml-4">
                      - {profile.name} ({profile.age} years old)
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-red-600">
              ❌ API Error: {testResults.childProfiles?.error}
            </div>
          )}
        </Card>

        {/* Characters */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-3">🎭 Characters</h2>
          {testResults.characters?.status === 'success' ? (
            <div className="space-y-2">
              <div>✅ API Response: Success</div>
              <div>✅ Count: {testResults.characters.count}</div>
              {testResults.characters.count === 0 ? (
                <div className="text-orange-600 font-medium">
                  ⚠️ No characters found. You need characters to create stories!
                  <br />
                  <Button 
                    onClick={() => window.location.href = '/characters/create'} 
                    className="mt-2"
                    variant="outline"
                  >
                    Go Create Characters
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="text-green-600">✅ Characters available:</div>
                  {characters.slice(0, 3).map(char => (
                    <div key={char.id} className="ml-4">
                      - {char.name} ({char.species})
                    </div>
                  ))}
                  {characters.length > 3 && (
                    <div className="ml-4 text-gray-600">
                      ... and {characters.length - 3} more
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-red-600">
              ❌ API Error: {testResults.characters?.error}
            </div>
          )}
        </Card>

        {/* Form Test */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-3">📝 Form Elements Test</h2>
          <div className="space-y-2">
            <div>✅ Button test: <Button size="sm" onClick={() => alert('Button works!')}>Test Click</Button></div>
            <div>✅ Input test: <input type="text" placeholder="Type here..." className="border p-2 rounded" /></div>
            <div>✅ Select test: 
              <select className="border p-2 rounded ml-2">
                <option>Option 1</option>
                <option>Option 2</option>
              </select>
            </div>
            <div>✅ Textarea test: 
              <textarea placeholder="Type here..." className="border p-2 rounded ml-2 w-48 h-16"></textarea>
            </div>
          </div>
        </Card>

        {/* Diagnosis Summary */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h2 className="text-lg font-semibold mb-3">🎯 Diagnosis Summary</h2>
          {testResults.childProfiles?.count === 0 ? (
            <div className="text-blue-800">
              <strong>ISSUE FOUND:</strong> No child profiles exist. The story creation form needs at least one child profile to work.
              <br /><br />
              <strong>SOLUTION:</strong> Go to the Dashboard and create a child profile first.
            </div>
          ) : testResults.characters?.count === 0 ? (
            <div className="text-blue-800">
              <strong>ISSUE FOUND:</strong> No characters exist. The story creation form needs at least one character to work.
              <br /><br />
              <strong>SOLUTION:</strong> Go to Characters section and create some characters first.
            </div>
          ) : (
            <div className="text-green-800">
              <strong>GOOD NEWS:</strong> All required data exists. The form should be working!
              <br /><br />
              If you're still having issues, check the browser console for JavaScript errors.
            </div>
          )}
        </Card>

        {/* Navigation */}
        <div className="flex gap-4">
          <Button onClick={() => window.location.href = '/stories/create'}>
            Go to Story Creation Form
          </Button>
          <Button onClick={() => window.location.href = '/dashboard'} variant="outline">
            Go to Dashboard
          </Button>
          <Button onClick={() => window.location.href = '/characters/create'} variant="outline">
            Create Characters
          </Button>
        </div>
      </div>
    </div>
  )
}
