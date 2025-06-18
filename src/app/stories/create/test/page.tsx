'use client'

import { useSession } from 'next-auth/react'

export default function SimpleFormTest() {
  const { data: session } = useSession()
  
  console.log('🧪 Simple form test - session:', session)
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Simple Form Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="mb-4">Session status: {session ? 'Authenticated' : 'Not authenticated'}</p>
          
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Test Input</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border rounded"
                placeholder="Type something..."
              />
            </div>
            
            <button 
              type="button"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => console.log('Button clicked!')}
            >
              Test Button
            </button>
          </form>
          
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <p className="text-sm">If you can see this form and interact with it, the basic React/Next.js setup is working.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
