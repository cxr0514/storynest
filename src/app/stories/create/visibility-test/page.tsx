'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function DiagnosticVisibility() {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setMounted(true)
    console.log('🧪 Diagnostic page mounted')
  }, [])

  if (!mounted) {
    return <div>Loading...</div>
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '2rem',
      backgroundColor: '#f3f4f6',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          color: '#1f2937'
        }}>
          🧪 Visibility Diagnostic Test
        </h1>

        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#f9fafb', 
          borderRadius: '6px',
          marginBottom: '1.5rem',
          border: '1px solid #e5e7eb'
        }}>
          <p><strong>✅ This page is visible</strong></p>
          <p>If you can see this, React rendering is working correctly.</p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
            Interactive Tests
          </h2>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <button
              onClick={() => setVisible(!visible)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Toggle Visibility
            </button>
            
            <button
              onClick={() => console.log('Button clicked!')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Log to Console
            </button>
          </div>

          {visible && (
            <div style={{
              padding: '1rem',
              backgroundColor: '#dbeafe',
              borderRadius: '6px',
              border: '1px solid #93c5fd'
            }}>
              <p>✅ This element can be toggled on/off</p>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
            Form Elements Test
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Type something..."
              style={{
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
              onChange={(e) => console.log('Input:', e.target.value)}
            />
            
            <select
              style={{
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
              onChange={(e) => console.log('Select:', e.target.value)}
            >
              <option value="">Choose an option...</option>
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
            </select>
            
            <textarea
              placeholder="Enter text here..."
              rows={3}
              style={{
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem',
                resize: 'vertical'
              }}
              onChange={(e) => console.log('Textarea:', e.target.value)}
            />
          </div>
        </div>

        <div style={{
          padding: '1rem',
          backgroundColor: '#f0fdf4',
          borderRadius: '6px',
          border: '1px solid #bbf7d0'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            ✅ All Tests Passed
          </h3>
          <p>If you can interact with all elements above, the basic form functionality should work.</p>
          <p style={{ marginTop: '0.5rem' }}>
            <strong>Next:</strong> Test the story creation forms in this order:
          </p>
          <ol style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
            <li><Link href="/stories/create/simple" style={{ color: '#3b82f6' }}>/stories/create/simple</Link></li>
            <li><Link href="/stories/create/no-animation" style={{ color: '#3b82f6' }}>/stories/create/no-animation</Link></li>
            <li><Link href="/stories/create" style={{ color: '#3b82f6' }}>/stories/create</Link> (original)</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
