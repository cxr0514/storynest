'use client'

import { useState, useEffect } from 'react'

// Floating action button with enhanced animations
interface FloatingActionButtonProps {
  onClick: () => void
  icon: string
  label: string
  className?: string
}

export function FloatingActionButton({ onClick, icon, label, className = '' }: FloatingActionButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          group relative bg-gradient-to-r from-orange-500 to-rose-500 
          text-white rounded-full shadow-lg hover:shadow-2xl
          transition-all duration-300 ease-out
          hover:scale-110 hover:rotate-3 active:scale-95
          w-14 h-14 flex items-center justify-center
          animate-gentle-bounce
          ${className}
        `}
      >
        <span className="text-2xl group-hover:animate-wiggle">{icon}</span>
        
        {/* Tooltip */}
        <div
          className={`
            absolute right-full mr-3 px-3 py-2 bg-gray-800 text-white text-sm
            rounded-lg whitespace-nowrap pointer-events-none
            transition-all duration-200 ease-out
            ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          `}
        >
          {label}
          <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
        </div>

        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-active:opacity-20 group-active:animate-ping"></div>
      </button>
    </div>
  )
}

// Interactive icon with micro animations
interface AnimatedIconProps {
  icon: string
  animation?: 'bounce' | 'pulse' | 'wiggle' | 'rotate' | 'heartbeat'
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function AnimatedIcon({ icon, animation = 'bounce', className = '', size = 'md' }: AnimatedIconProps) {
  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-6xl'
  }

  const animations = {
    bounce: 'animate-gentle-bounce',
    pulse: 'animate-pulse',
    wiggle: 'hover:animate-wiggle',
    rotate: 'hover:rotate-12 transition-transform duration-300',
    heartbeat: 'animate-heartbeat'
  }

  return (
    <span className={`inline-block ${sizes[size]} ${animations[animation]} ${className}`}>
      {icon}
    </span>
  )
}

// Progress indicator with smooth animations
interface AnimatedProgressProps {
  progress: number
  showText?: boolean
  color?: 'primary' | 'success' | 'warning' | 'error'
  className?: string
}

export function AnimatedProgress({ progress, showText = true, color = 'primary', className = '' }: AnimatedProgressProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress)
    }, 100)

    return () => clearTimeout(timer)
  }, [progress])

  const colors = {
    primary: 'from-orange-500 to-rose-500',
    success: 'from-green-400 to-emerald-500',
    warning: 'from-yellow-400 to-orange-500',
    error: 'from-red-400 to-pink-500'
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`
            h-full bg-gradient-to-r ${colors[color]} rounded-full
            transition-all duration-1000 ease-out
            relative overflow-hidden
          `}
          style={{ width: `${Math.min(Math.max(animatedProgress, 0), 100)}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
        </div>
      </div>
      {showText && (
        <div className="mt-1 text-center text-sm font-medium text-gray-600">
          {Math.round(animatedProgress)}%
        </div>
      )}
    </div>
  )
}

// Notification toast with animations
interface ToastNotificationProps {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export function ToastNotification({ message, type, isVisible, onClose, duration = 3000 }: ToastNotificationProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-black',
    info: 'bg-blue-500 text-white'
  }

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className={`
        ${typeStyles[type]} px-6 py-4 rounded-lg shadow-lg
        flex items-center space-x-3 max-w-sm
        animate-scale-in
      `}>
        <span className="text-xl animate-gentle-bounce">{icons[type]}</span>
        <span className="flex-1">{message}</span>
        <button
          onClick={onClose}
          className="text-lg hover:scale-110 transition-transform duration-200"
        >
          ×
        </button>
      </div>
    </div>
  )
}

// Enhanced input field with focus animations
interface AnimatedInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  type?: 'text' | 'email' | 'password' | 'number'
  error?: string
  className?: string
}

export function AnimatedInput({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  type = 'text',
  error,
  className = ''
}: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)

  useEffect(() => {
    setHasValue(value.length > 0)
  }, [value])

  return (
    <div className={`relative ${className}`}>
      <label
        className={`
          absolute left-3 transition-all duration-200 pointer-events-none
          ${isFocused || hasValue 
            ? 'top-0 text-xs text-orange-600 bg-white px-1 -translate-y-1/2' 
            : 'top-1/2 text-gray-500 -translate-y-1/2'}
          ${error ? 'text-red-500' : ''}
        `}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={isFocused ? placeholder : ''}
        className={`
          w-full px-3 py-3 border-2 rounded-lg
          transition-all duration-200 ease-out
          focus:outline-none focus:scale-105
          ${error 
            ? 'border-red-500 focus:border-red-600' 
            : 'border-gray-300 focus:border-orange-500'}
          ${isFocused ? 'shadow-lg shadow-orange-200/50' : ''}
        `}
      />
      
      {error && (
        <div className="mt-1 text-sm text-red-500 animate-slide-in-down">
          {error}
        </div>
      )}
    </div>
  )
}

// Staggered list animation
interface StaggeredListProps {
  children: React.ReactNode[]
  delay?: number
  className?: string
}

export function StaggeredList({ children, delay = 100, className = '' }: StaggeredListProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className="scroll-animate"
          style={{ animationDelay: `${index * delay}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}

// Loading dots animation
export function LoadingDots({ className = '' }: { className?: string }) {
  return (
    <div className={`flex space-x-1 ${className}`}>
      <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-75"></div>
      <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-150"></div>
    </div>
  )
}

// Particle effect background
export function ParticleBackground() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10
  }))

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute bg-orange-200/20 rounded-full animate-float"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      ))}
    </div>
  )
}
