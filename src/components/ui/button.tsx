import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'magical'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  animation?: 'none' | 'bounce' | 'pulse' | 'wiggle' | 'glow'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, animation = 'none', children, disabled, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95'
    
    const variants = {
      primary: 'bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:from-orange-600 hover:to-rose-600 hover:shadow-xl hover:scale-105 shadow-lg focus:ring-orange-500 hover:shadow-orange-200/50',
      secondary: 'bg-white/80 backdrop-blur-sm text-orange-700 border border-orange-200 hover:bg-orange-50 hover:border-orange-300 hover:shadow-md shadow-sm focus:ring-orange-500 hover:scale-105',
      outline: 'border-2 border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400 hover:shadow-lg hover:scale-105 focus:ring-orange-500 transition-spring',
      ghost: 'text-orange-700 hover:text-orange-800 hover:bg-orange-50/50 hover:scale-105 focus:ring-orange-500',
      gradient: 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 hover:shadow-2xl hover:scale-105 shadow-lg focus:ring-purple-500 animate-morph-bg',
      magical: 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:shadow-2xl hover:scale-110 shadow-lg focus:ring-purple-500 animate-morph-bg hover:animate-gentle-bounce'
    }
    
    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg'
    }
    
    const animations = {
      none: '',
      bounce: 'hover:animate-gentle-bounce',
      pulse: 'hover:animate-pulse',
      wiggle: 'hover:animate-wiggle',
      glow: 'hover:animate-heartbeat hover:shadow-2xl hover:shadow-orange-400/50'
    }
    
    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          animations[animation],
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="loading-dots">Loading</span>
          </div>
        )}
        {!isLoading && children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
export type { ButtonProps }
