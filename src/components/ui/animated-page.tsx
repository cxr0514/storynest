'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { useScrollAnimation } from '@/lib/animations'

interface AnimatedPageProps {
  children: ReactNode
  animation?: 'fade' | 'slide-up' | 'slide-right' | 'slide-left' | 'scale' | 'none'
  className?: string
  stagger?: boolean
  delay?: number
}

export function AnimatedPage({ 
  children, 
  animation = 'fade', 
  className = '', 
  stagger = false,
  delay = 0
}: AnimatedPageProps) {
  const pageRef = useRef<HTMLDivElement>(null)
  const { cleanup } = useScrollAnimation()

  useEffect(() => {
    if (pageRef.current && animation !== 'none') {
      const animationClass = getAnimationClass(animation)
      const activeClass = getActiveClass(animation)
      
      // Apply initial animation state
      pageRef.current.classList.add(...animationClass.split(' '))
      
      // Trigger animation on mount with a small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        if (pageRef.current) {
          pageRef.current.classList.add(...activeClass.split(' '))
        }
      }, Math.max(delay, 50)) // Minimum 50ms delay to ensure proper rendering
      
      return () => {
        clearTimeout(timer)
        cleanup()
      }
    }

    return cleanup
  }, [animation, delay, cleanup])

  const getAnimationClass = (anim: string): string => {
    switch (anim) {
      case 'fade':
        return 'opacity-0 transition-all duration-500 ease-out'
      case 'slide-up':
        return 'opacity-0 translate-y-8 transition-all duration-600 ease-out'
      case 'slide-right':
        return 'opacity-0 -translate-x-8 transition-all duration-500 ease-out'
      case 'slide-left':
        return 'opacity-0 translate-x-8 transition-all duration-500 ease-out'
      case 'scale':
        return 'opacity-0 scale-95 transition-all duration-400 ease-out'
      default:
        return ''
    }
  }

  const getActiveClass = (anim: string): string => {
    switch (anim) {
      case 'fade':
        return 'opacity-100'
      case 'slide-up':
        return 'opacity-100 translate-y-0'
      case 'slide-right':
        return 'opacity-100 translate-x-0'
      case 'slide-left':
        return 'opacity-100 translate-x-0'
      case 'scale':
        return 'opacity-100 scale-100'
      default:
        return ''
    }
  }

  const delayClass = delay > 0 ? `delay-[${delay}ms]` : ''

  return (
    <div 
      ref={pageRef}
      className={`${delayClass} ${className}`}
    >
      {stagger ? (
        <StaggeredChildren>
          {children}
        </StaggeredChildren>
      ) : (
        children
      )}
    </div>
  )
}

interface StaggeredChildrenProps {
  children: ReactNode
  delay?: number
}

function StaggeredChildren({ children, delay = 75 }: StaggeredChildrenProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { observeElement, cleanup } = useScrollAnimation()

  useEffect(() => {
    if (containerRef.current) {
      const childElements = containerRef.current.children
      
      Array.from(childElements).forEach((child, index) => {
        const staggerDelay = index * delay
        const animationClass = `opacity-0 translate-y-4 transition-all duration-500 ease-out delay-[${staggerDelay}ms]`
        const activeClass = 'opacity-100 translate-y-0'
        
        observeElement(child, animationClass, activeClass)
      })
    }

    return cleanup
  }, [delay, observeElement, cleanup])

  return (
    <div ref={containerRef}>
      {children}
    </div>
  )
}

export { StaggeredChildren }
