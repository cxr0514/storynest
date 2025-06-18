'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [isNavigating, setIsNavigating] = useState(false)
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Stories', href: '/stories' },
    { name: 'Characters', href: '/characters' },
  ]
  
  const isHomePage = pathname === '/'
  
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const handleNavigation = (href: string) => {
    setIsNavigating(true)
    router.push(href)
    setTimeout(() => {
      setIsNavigating(false)
    }, 150) // Reset navigation state after delay
  }
  
  return (
    <header className="bg-gradient-to-r from-sky-200/90 via-purple-100/90 to-pink-200/90 backdrop-blur-sm border-b-2 border-purple-300/50 shadow-lg sticky top-0 z-50 transition-all duration-300 relative overflow-hidden">
      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-2 left-20 text-sm animate-float opacity-30">⭐</div>
        <div className="absolute top-1 right-32 text-xs animate-bounce-slow opacity-20">✨</div>
        <div className="absolute top-3 left-1/2 text-xs animate-float opacity-25">🌈</div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2 cursor-pointer hover:scale-105 transition-transform duration-200 group" onClick={() => handleNavigation('/')}>
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 via-purple-500 to-blue-500 rounded-xl flex items-center justify-center hover:rotate-12 transition-transform duration-300 shadow-lg cartoon-shadow">
                <span className="text-white font-bold text-lg animate-bounce-gentle">📚</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent animate-text-glow">
                StoryNest ✨
              </h1>
            </div>
            
            {!isHomePage && (
              <nav className="hidden md:flex space-x-6">
                {navigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    disabled={isNavigating}
                    className={`text-sm font-bold transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 relative px-3 py-2 rounded-xl ${
                      pathname === item.href
                        ? 'text-purple-700 bg-white/50 shadow-lg'
                        : 'text-purple-600 hover:text-purple-800 hover:bg-white/30'
                    }`}
                  >
                    {item.name} {pathname === item.href ? '✨' : '🎨'}
                    {pathname === item.href && (
                      <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full animate-scale-in"></div>
                    )}
                  </button>
                ))}
              </nav>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {!isHomePage && session && (
              <Button 
                variant="gradient" 
                size="sm"
                onClick={() => handleNavigation('/stories/create')}
                disabled={isNavigating}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg hover:scale-110 transition-all duration-200 animate-bounce-gentle"
              >
                ✨ Create Magic ✨
              </Button>
            )}
            
            {session ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-purple-700 animate-fade-in bg-white/50 px-3 py-1 rounded-full shadow-sm">
                  🌟 Hi, {session.user?.name?.split(' ')[0]}!
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="text-purple-600 hover:text-purple-800 hover:bg-white/40 hover:scale-110 transition-all duration-200 rounded-xl"
                >
                  👋 Sign Out
                </Button>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleNavigation('/auth/signin')}
                disabled={isNavigating}
                className="text-purple-600 hover:text-purple-800 hover:bg-white/40 hover:scale-110 transition-all duration-200 rounded-xl font-medium"
              >
                🚀 Sign In
              </Button>
            )}
            
            {isHomePage && !session && (
              <Button 
                variant="magical" 
                size="sm" 
                onClick={() => handleNavigation('/auth/signin')}
                disabled={isNavigating}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:scale-110 transition-all duration-200 animate-bounce-gentle"
              >
                🎨 Get Started
              </Button>
            )}
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {!isHomePage && (
          <div className="md:hidden pb-3 animate-slide-in bg-white/30 rounded-xl mx-2 mb-2 shadow-sm">
            <nav className="flex space-x-2 p-2">
              {navigation.map((item, index) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  disabled={isNavigating}
                  className={`text-sm font-bold px-3 py-2 rounded-xl transition-all duration-300 hover:scale-105 animate-fade-in ${
                    pathname === item.href
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-purple-600 hover:text-purple-800 hover:bg-white/50'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {item.name} {pathname === item.href ? '✨' : '🎨'}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
