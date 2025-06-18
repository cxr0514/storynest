'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export default function FormVisibilityDiagnostic() {
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)
  const [childProfiles, setChildProfiles] = useState([])
  const [debugInfo, setDebugInfo] = useState({})

  useEffect(() => {
    setMounted(true)
    
    // Test CSS visibility
    const testElement = document.createElement('div')
    testElement.style.cssText = 'position: absolute; top: -9999px; color: red; background: yellow; width: 100px; height: 100px;'
    document.body.appendChild(testElement)
    
    const computedStyle = window.getComputedStyle(testElement)
    setDebugInfo({
      canCreateElement: true,
      backgroundColor: computedStyle.backgroundColor,
      color: computedStyle.color,
      display: computedStyle.display,
      visibility: computedStyle.visibility,
      opacity: computedStyle.opacity
    })
    
    document.body.removeChild(testElement)
  }, [])

  useEffect(() => {
    if (session) {
      fetch('/api/child-profiles')
        .then(res => res.json())
        .then(data => setChildProfiles(data))
        .catch(err => console.error('API Error:', err))
    }
  }, [session])

  if (!mounted) {
    return null
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '20px', 
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>🧪 Form Visibility Diagnostic</h1>
      
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #ddd'
      }}>
        <h2>Authentication Status</h2>
        <p>Status: <strong>{status}</strong></p>
        <p>Session: <strong>{session ? 'Present' : 'None'}</strong></p>
        {session && (
          <p>User: <strong>{session.user?.email}</strong></p>
        )}
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #ddd'
      }}>
        <h2>CSS & Rendering Test</h2>
        <p>Mounted: <strong>{mounted ? 'Yes' : 'No'}</strong></p>
        <p>Can create elements: <strong>{debugInfo.canCreateElement ? 'Yes' : 'No'}</strong></p>
        <p>Test background: <strong>{debugInfo.backgroundColor}</strong></p>
        <p>Test display: <strong>{debugInfo.display}</strong></p>
        <p>Test visibility: <strong>{debugInfo.visibility}</strong></p>
        <p>Test opacity: <strong>{debugInfo.opacity}</strong></p>
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #ddd'
      }}>
        <h2>API Test</h2>
        <p>Child Profiles Count: <strong>{childProfiles.length}</strong></p>
        {childProfiles.length > 0 && (
          <div>
            <h3>Profiles:</h3>
            {childProfiles.map((profile, index) => (
              <p key={profile.id || index}>
                {profile.name} (Age: {profile.age})
              </p>
            ))}
          </div>
        )}
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #ddd'
      }}>
        <h2>Interactive Test</h2>
        <button 
          onClick={() => alert('Button works!')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Test Button
        </button>
        
        <input 
          type="text" 
          placeholder="Type here to test input"
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        />
      </div>

      <div style={{ 
        backgroundColor: '#fff3cd', 
        padding: '15px', 
        borderRadius: '8px',
        border: '1px solid #ffeaa7'
      }}>
        <h3>🔍 Next Steps:</h3>
        <ol>
          <li>If you can see this page and interact with elements, basic React is working</li>
          <li>If authentication shows "authenticated" and you have child profiles, APIs are working</li>
          <li>If CSS tests show proper values, styling system is working</li>
          <li>The issue with the main form is likely in component dependencies or specific CSS classes</li>
        </ol>
      </div>
    </div>
  )
}
