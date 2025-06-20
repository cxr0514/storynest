'use client'

import Image from 'next/image'

export default function TestImage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Image Test Page</h1>
      
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Test 1: Direct Image Tag</h2>
        <img 
          src="/uploads/illustrations_febb38a7-3b52-4812-9b7f-17a6574e08b3.png" 
          alt="Test with regular img tag"
          className="w-64 h-64 object-cover border-2 border-gray-300"
        />
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Test 2: Next.js Image Component</h2>
        <div className="relative w-64 h-64">
          <Image
            src="/uploads/illustrations_febb38a7-3b52-4812-9b7f-17a6574e08b3.png"
            alt="Test with Next.js Image component"
            fill
            className="object-cover border-2 border-blue-300"
          />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Test 3: Next.js Image with width/height</h2>
        <Image
          src="/uploads/illustrations_febb38a7-3b52-4812-9b7f-17a6574e08b3.png"
          alt="Test with width/height"
          width={256}
          height={256}
          className="object-cover border-2 border-green-300"
        />
      </div>
    </div>
  )
}
