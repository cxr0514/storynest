'use client'

import { useEffect, useState } from 'react'

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayChildren, setDisplayChildren] = useState(children)

  useEffect(() => {
    if (displayChildren !== children) {
      setIsTransitioning(true)
      
      const timer = setTimeout(() => {
        setDisplayChildren(children)
        setIsTransitioning(false)
      }, 150)

      return () => clearTimeout(timer)
    }
  }, [children, displayChildren])

  return (
    <div className="relative min-h-screen">
      <div
        className={`transition-all duration-300 ease-out ${
          isTransitioning 
            ? 'opacity-0 scale-98 blur-sm' 
            : 'opacity-100 scale-100 blur-0'
        }`}
      >
        {displayChildren}
      </div>
      
      {/* Page transition overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 bg-gradient-to-br from-amber-50/50 via-orange-50/50 to-rose-50/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-full mx-auto mb-4 relative animate-spin">
              <div className="absolute inset-2 bg-white rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-purple-500 text-xs">✨</div>
            </div>
            <p className="text-gray-600 loading-dots">Transitioning</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Route-specific animations
export function RouteTransition({ children, route }: { children: React.ReactNode, route: string }) {
  const getRouteAnimation = (routeName: string) => {
    switch (routeName) {
      case '/dashboard':
        return 'animate-fade-in'
      case '/stories/create':
        return 'animate-slide-in-right'
      case '/characters/create':
        return 'animate-slide-in-left'
      case '/stories':
        return 'animate-slide-in-up'
      case '/analytics':
        return 'animate-scale-in'
      case '/recommendations':
        return 'animate-slide-in-down'
      default:
        return 'animate-fade-in'
    }
  }

  return (
    <div className={`${getRouteAnimation(route)} transition-all duration-500`}>
      {children}
    </div>
  )
}
