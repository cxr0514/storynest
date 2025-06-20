'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function DebugCreateStory() {
  const { data: session, status } = useSession()
  const [debugInfo, setDebugInfo] = useState({
    sessionStatus: 'loading',
    apiTest: 'not tested',
    errorDetails: null as string | null
  })

  useEffect(() => {
    console.log('🔍 Debug page loaded')
    console.log('Session status:', status)
    console.log('Session data:', session)
    
    setDebugInfo(prev => ({
      ...prev,
      sessionStatus: status
    }))

    // Test API endpoints
    if (session) {
      testAPI()
    }
  }, [session, status])

  const testAPI = async () => {
    try {
      console.log('🧪 Testing child-profiles API...')
      const response = await fetch('/api/child-profiles')
      console.log('API Response:', response.status, response.statusText)
      
      if (response.ok) {
        const data = await response.json()
        console.log('API Data:', data)
        setDebugInfo(prev => ({
          ...prev,
          apiTest: `✅ Success: ${data.length} profiles`
        }))
      } else {
        setDebugInfo(prev => ({
          ...prev,
          apiTest: `❌ Failed: ${response.status}`
        }))
      }
    } catch (error) {
      console.error('API Test Error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const errorString = error instanceof Error ? error.toString() : String(error)
      setDebugInfo(prev => ({
        ...prev,
        apiTest: `❌ Error: ${errorMessage}`,
        errorDetails: errorString
      }))
    }
  }

  return (
    <div style={{ 
      padding: '2rem', 
      fontFamily: 'monospace',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333', marginBottom: '2rem' }}>
        🔍 Story Creation Debug Page
      </h1>
      
      <div style={{ 
        backgroundColor: 'white', 
        padding: '1.5rem', 
        borderRadius: '8px',
        marginBottom: '1rem',
        border: '1px solid #ddd'
      }}>
        <h2 style={{ marginBottom: '1rem', color: '#555' }}>Debug Information</h2>
        
        <div style={{ marginBottom: '1rem' }}>
          <strong>Session Status:</strong> {debugInfo.sessionStatus}
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <strong>User:</strong> {session?.user?.email || 'Not authenticated'}
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <strong>API Test:</strong> {debugInfo.apiTest}
        </div>
        
        {debugInfo.errorDetails && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            backgroundColor: '#ffe6e6',
            border: '1px solid #ff9999',
            borderRadius: '4px'
          }}>
            <strong>Error Details:</strong>
            <pre style={{ 
              whiteSpace: 'pre-wrap', 
              fontSize: '0.9em',
              marginTop: '0.5rem'
            }}>
              {debugInfo.errorDetails}
            </pre>
          </div>
        )}
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        padding: '1.5rem', 
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}>
        <h2 style={{ marginBottom: '1rem', color: '#555' }}>Actions</h2>
        
        {!session ? (
          <div>
            <p style={{ marginBottom: '1rem' }}>You need to sign in first.</p>
            <a 
              href="/auth/signin"
              style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                backgroundColor: '#007bff',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px'
              }}
            >
              Sign In
            </a>
          </div>
        ) : (
          <div>
            <button 
              onClick={testAPI}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                marginRight: '1rem',
                cursor: 'pointer'
              }}
            >
              Test API Again
            </button>
            
            <Link 
              href="/stories/create"
              style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                backgroundColor: '#6c757d',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px'
              }}
            >
              Back to Story Creation
            </Link>
          </div>
        )}
      </div>
      
      <div style={{ 
        marginTop: '2rem',
        fontSize: '0.9em',
        color: '#666'
      }}>
        <p><strong>Console Log:</strong> Check the browser console for detailed logs</p>
        <p><strong>Page URL:</strong> /stories/create/debug</p>
        <p><strong>Time:</strong> {new Date().toISOString()}</p>
      </div>
    </div>
  )
}
