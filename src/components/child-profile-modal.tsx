'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ChildProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ChildProfileModal({ isOpen, onClose, onSuccess }: ChildProfileModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    interests: [] as string[]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const availableInterests = [
    'Adventure', 'Magic', 'Animals', 'Space', 'Dinosaurs', 'Fantasy', 
    'Science', 'Art', 'Music', 'Sports', 'Nature', 'Robots',
    'Princesses', 'Dragons', 'Ocean', 'Friends', 'Family', 'School'
  ]

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors([])

    try {
      const response = await fetch('/api/child-profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setFormData({ name: '', age: '', interests: [] })
        onSuccess()
        onClose()
      } else {
        const errorData = await response.json()
        setErrors([errorData.error || 'Failed to create child profile'])
      }
    } catch (error) {
      setErrors(['An unexpected error occurred'])
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold">Create Child Profile</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Display */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <ul className="text-red-600 text-sm">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Child's Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your child's name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            {/* Age Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age *
              </label>
              <input
                type="number"
                min="0"
                max="18"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                placeholder="Age"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            {/* Interests Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Interests (Select all that apply)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableInterests.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest.toLowerCase())}
                    className={`px-3 py-2 text-sm rounded-lg border transition-all duration-200 ${
                      formData.interests.includes(interest.toLowerCase())
                        ? 'bg-orange-100 border-orange-300 text-orange-800'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Selected: {formData.interests.length} interests
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600"
              >
                {isSubmitting ? 'Creating...' : 'Create Profile'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
