'use client'

import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function SignIn() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if user is already signed in
    getSession().then((session) => {
      if (session) {
        router.push('/dashboard')
      }
    })
  }, [router])

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const result = await signIn('google', {
        callbackUrl: '/dashboard',
        redirect: false
      })
      
      if (result?.ok) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200/90 via-purple-100/90 to-pink-200/90 relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl animate-float opacity-20">🎈</div>
        <div className="absolute top-20 right-20 text-4xl animate-bounce-slow opacity-25">⭐</div>
        <div className="absolute bottom-20 left-20 text-5xl animate-float opacity-20">🌈</div>
        <div className="absolute top-1/3 left-1/4 text-3xl animate-bounce-gentle opacity-15">🦋</div>
        <div className="absolute bottom-1/3 right-1/4 text-4xl animate-float opacity-20">🎪</div>
        <div className="absolute top-2/3 right-10 text-3xl animate-bounce-slow opacity-25">🎨</div>
        <div className="absolute bottom-10 right-1/3 text-2xl animate-float opacity-20">✨</div>
        <div className="absolute top-1/2 left-10 text-3xl animate-bounce-gentle opacity-15">🌟</div>
      </div>

      {/* Main Sign-in Card */}
      <Card className="w-full max-w-md backdrop-blur-sm bg-white/80 shadow-2xl border-2 border-purple-200/50 relative z-10">
        <CardContent className="p-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 via-purple-500 to-blue-500 rounded-2xl flex items-center justify-center hover:rotate-12 transition-transform duration-300 shadow-xl animate-bounce-gentle">
                <span className="text-white font-bold text-2xl">📚</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent mb-2 animate-text-glow">
              Welcome to StoryNest
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              Sign in to create magical bedtime stories for your children ✨
            </p>
          </div>

          {/* Sign-in Button */}
          <div className="space-y-6">
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-14 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 relative overflow-hidden"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  <span className="animate-pulse">Signing you in...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                  <span className="text-xl">🚀</span>
                </div>
              )}
              {/* Shimmer Effect */}
              <div className="absolute inset-0 -top-[1px] -bottom-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000"></div>
            </Button>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-purple-200/50">
                <div className="text-2xl mb-1">📖</div>
                <div className="text-xs font-medium text-purple-700">Unlimited Stories</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border border-pink-200/50">
                <div className="text-2xl mb-1">🎨</div>
                <div className="text-xs font-medium text-pink-700">Custom Characters</div>
              </div>
            </div>

            {/* Terms */}
            <div className="text-center text-sm text-gray-500 bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-lg border border-orange-200/50">
              <span className="text-orange-600">🔒</span> By signing in, you agree to our Terms of Service and Privacy Policy
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Visual Elements */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <div className="flex items-center justify-center space-x-2 text-purple-600/70">
          <span className="text-sm font-medium">Powered by</span>
          <div className="flex items-center space-x-1">
            <span className="text-lg">🤖</span>
            <span className="text-sm font-bold">AI Magic</span>
          </div>
          <span className="text-sm">•</span>
          <div className="flex items-center space-x-1">
            <span className="text-lg">❤️</span>
            <span className="text-sm font-bold">Made with Love</span>
          </div>
        </div>
      </div>
    </div>
  )
}
