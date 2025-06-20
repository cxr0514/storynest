'use client'

import { useState } from 'react'

interface ChildProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ChildProfileModal({ isOpen, onClose, onSuccess }: ChildProfileModalProps) {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const interestOptions = [
    { key: 'adventure', label: '🏔️ Adventure' },
    { key: 'magic', label: '✨ Magic' },
    { key: 'animals', label: '🐾 Animals' },
    { key: 'space', label: '🚀 Space' },
    { key: 'dinosaurs', label: '🦕 Dinosaurs' },
    { key: 'fantasy', label: '🧚 Fantasy' },
    { key: 'science', label: '🔬 Science' },
    { key: 'art', label: '🎨 Art' },
    { key: 'music', label: '🎵 Music' },
    { key: 'sports', label: '⚽ Sports' },
    { key: 'nature', label: '🌳 Nature' },
    { key: 'robots', label: '🤖 Robots' },
    { key: 'princesses', label: '👑 Princesses' },
    { key: 'dragons', label: '🐉 Dragons' },
    { key: 'ocean', label: '🌊 Ocean' },
    { key: 'friends', label: '👫 Friends' },
    { key: 'family', label: '👨‍👩‍👧‍👦 Family' },
    { key: 'school', label: '🏫 School' }
  ]

  const maxInterests = 5

  const toggleInterest = (interest: string) => {
    setInterests(prev => {
      if (prev.includes(interest)) {
        return prev.filter(i => i !== interest)
      } else if (prev.length < maxInterests) {
        return [...prev, interest]
      }
      return prev
    })
  }

  const getProgress = () => {
    let progress = 0
    if (name) progress++
    if (age) progress++
    if (interests.length > 0) progress++
    return progress
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      if (!name || !age) {
        setError('Please fill in all required fields.')
        return
      }

      const response = await fetch('/api/child-profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name.trim(),
          age: parseInt(age),
          interests: interests
        })
      })

      if (response.ok) {
        setShowSuccess(true)
        setTimeout(() => {
          setName('')
          setAge('')
          setInterests([])
          setShowSuccess(false)
          onSuccess()
          onClose()
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create child profile')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Background with animations */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-[10%] left-[10%] w-20 h-20 bg-gradient-to-br from-red-400 to-teal-400 rounded-full animate-bounce"></div>
          <div className="absolute top-[70%] left-[80%] w-15 h-15 bg-gradient-to-br from-red-400 to-teal-400 rounded-full animate-bounce" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-[40%] left-[5%] w-25 h-25 bg-gradient-to-br from-red-400 to-teal-400 rounded-full animate-bounce" style={{ animationDelay: '4s' }}></div>
        </div>
      </div>

      {/* Modal Container */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative w-full max-w-lg">
          {/* Form Container */}
          <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 animate-in slide-in-from-bottom-8 duration-800">
            {/* Animated top border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 via-teal-400 via-blue-500 to-green-400 bg-[length:300%_100%] animate-pulse rounded-t-3xl"></div>
            
            {/* Progress indicator */}
            <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
              {getProgress()}/3
            </div>

            {/* Header */}
            {!showSuccess && (
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold bg-gradient-to-br from-indigo-600 to-purple-700 bg-clip-text text-transparent mb-2">
                  Create Child Profile
                </h1>
                <p className="text-gray-600 text-sm">Let&apos;s create a magical story experience for your child</p>
              </div>
            )}

            {/* Success Animation */}
            {showSuccess && (
              <div className="text-center py-8 animate-in zoom-in duration-600">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <span className="text-white text-2xl">✓</span>
                </div>
                <h2 className="text-xl font-bold text-green-600 mb-2">Profile Created!</h2>
                <p className="text-gray-600 text-sm">Your child&apos;s profile has been successfully created.</p>
              </div>
            )}

            {/* Error Display */}
            {error && !showSuccess && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex">
                  <div className="text-red-600 text-sm font-medium">⚠️ {error}</div>
                </div>
              </div>
            )}

            {/* Form */}
            {!showSuccess && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Input */}
                <div className="animate-in slide-in-from-right duration-600">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Child&apos;s Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm bg-white transition-all duration-300 focus:outline-none focus:border-indigo-500 focus:shadow-lg focus:shadow-indigo-500/10 focus:-translate-y-0.5 hover:border-gray-300"
                    placeholder="Enter your child's name"
                    required
                  />
                </div>

                {/* Age Input */}
                <div className="animate-in slide-in-from-right duration-600" style={{ animationDelay: '100ms' }}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm bg-gradient-to-br from-slate-50 to-gray-100 transition-all duration-300 focus:outline-none focus:border-indigo-500 focus:shadow-lg focus:shadow-indigo-500/10 focus:-translate-y-0.5 hover:border-gray-300"
                    placeholder="Enter age (3-12)"
                    min="3"
                    max="12"
                    required
                  />
                </div>

                {/* Interests */}
                <div className="animate-in slide-in-from-right duration-600" style={{ animationDelay: '200ms' }}>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Interests & Hobbies
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {interestOptions.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => toggleInterest(option.key)}
                        className={`relative px-3 py-2.5 border-2 rounded-xl text-xs font-medium text-center cursor-pointer transition-all duration-300 overflow-hidden group ${
                          interests.includes(option.key)
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-indigo-500 scale-105'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/15'
                        }`}
                      >
                        <span className="relative z-10">{option.label}</span>
                        {!interests.includes(option.key) && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    Selected: {interests.length} interests (max {maxInterests})
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 border-2 border-gray-200 rounded-xl text-sm font-semibold transition-all duration-300 hover:bg-gray-200 hover:-translate-y-1 hover:shadow-lg"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/40 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden"
                  >
                    {isSubmitting && (
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700"></div>
                    )}
                    <span className="relative flex items-center justify-center">
                      {isSubmitting && (
                        <div className="mr-2 w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      )}
                      {isSubmitting ? 'Creating Profile...' : 'Create Profile'}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
