'use client'

import { ReactNode } from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'primary' | 'secondary' | 'magic' | 'dots' | 'pulse'
  className?: string
  text?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'primary', 
  className = '',
  text = ''
}: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const variants = {
    primary: (
      <div className={`${sizes[size]} ${className}`}>
        <div className="relative">
          <div className="w-full h-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-lg animate-spin"></div>
          <div className="absolute inset-1 bg-white rounded"></div>
        </div>
      </div>
    ),
    secondary: (
      <div className={`${sizes[size]} ${className}`}>
        <svg className="animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    ),
    magic: (
      <div className={`${sizes[size]} ${className} relative`}>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-500 to-rose-500 rounded-full animate-spin"></div>
        <div className="absolute inset-1 bg-white rounded-full"></div>
        <div className="absolute inset-2 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs">✨</div>
      </div>
    ),
    dots: (
      <div className={`flex space-x-1 ${className}`}>
        <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full animate-bounce delay-75"></div>
        <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full animate-bounce delay-150"></div>
      </div>
    ),
    pulse: (
      <div className={`${sizes[size]} ${className}`}>
        <div className="w-full h-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-full animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      {variants[variant]}
      {text && (
        <p className="text-gray-600 text-sm loading-dots">{text}</p>
      )}
    </div>
  )
}

interface LoadingOverlayProps {
  isVisible: boolean
  children?: ReactNode
  variant?: 'primary' | 'magic' | 'minimal'
  text?: string
}

export function LoadingOverlay({ 
  isVisible, 
  children, 
  variant = 'primary',
  text = 'Loading...' 
}: LoadingOverlayProps) {
  if (!isVisible) return null

  const overlayVariants = {
    primary: 'bg-white/80 backdrop-blur-sm',
    magic: 'bg-gradient-to-br from-purple-50/90 via-pink-50/90 to-rose-50/90 backdrop-blur-md',
    minimal: 'bg-black/20 backdrop-blur-sm'
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${overlayVariants[variant]} animate-fade-in`}>
      <div className="text-center animate-scale-in">
        {children || (
          <>
            <LoadingSpinner 
              size="xl" 
              variant={variant === 'magic' ? 'magic' : 'primary'} 
              className="mb-4"
            />
            <p className="text-gray-700 text-lg font-medium loading-dots">{text}</p>
          </>
        )}
      </div>
    </div>
  )
}

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'card'
  animation?: 'pulse' | 'shimmer' | 'wave'
}

export function Skeleton({ 
  className = '', 
  variant = 'rectangular',
  animation = 'shimmer'
}: SkeletonProps) {
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'h-32 rounded-2xl'
  }

  const animations = {
    pulse: 'animate-pulse bg-gray-300',
    shimmer: 'animate-shimmer',
    wave: 'animate-float bg-gray-300'
  }

  return (
    <div 
      className={`
        ${variants[variant]} 
        ${animations[animation]} 
        ${className}
      `}
    />
  )
}

interface ProgressBarProps {
  progress: number
  variant?: 'primary' | 'magic' | 'minimal'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  showText?: boolean
  className?: string
}

export function ProgressBar({ 
  progress, 
  variant = 'primary',
  size = 'md',
  animated = true,
  showText = false,
  className = ''
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100)

  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  const variants = {
    primary: {
      background: 'bg-orange-100 border border-orange-200',
      fill: 'bg-gradient-to-r from-orange-500 to-rose-500'
    },
    magic: {
      background: 'bg-purple-100 border border-purple-200',
      fill: 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 animate-morph-bg'
    },
    minimal: {
      background: 'bg-gray-200',
      fill: 'bg-gray-600'
    }
  }

  const animationClass = animated ? 'transition-all duration-500 ease-out' : ''

  return (
    <div className={`w-full ${className}`}>
      <div className={`
        relative overflow-hidden rounded-full 
        ${sizes[size]} 
        ${variants[variant].background}
      `}>
        <div 
          className={`
            h-full rounded-full transition-all duration-500 ease-out
            ${variants[variant].fill}
            ${animationClass}
          `}
          style={{ width: `${clampedProgress}%` }}
        />
        {animated && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer opacity-50" />
        )}
      </div>
      {showText && (
        <div className="mt-2 text-center text-sm font-medium text-gray-600">
          {Math.round(clampedProgress)}%
        </div>
      )}
    </div>
  )
}

export { LoadingSpinner as default }
