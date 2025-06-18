import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outline' | 'glass' | 'gradient'
  hover?: boolean
  animation?: 'none' | 'fade' | 'slide' | 'scale' | 'float' | 'bounce'
  delay?: number
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = false, animation = 'none', delay = 0, children, ...props }, ref) => {
    const baseClasses = 'rounded-2xl transition-all duration-300 ease-out'
    
    const variants = {
      default: 'bg-white/60 backdrop-blur-sm border border-orange-200/50 shadow-lg',
      elevated: 'bg-white/80 backdrop-blur-sm border border-orange-200/30 shadow-xl',
      outline: 'border-2 border-orange-300 bg-white/40 backdrop-blur-sm',
      glass: 'glass backdrop-blur-lg shadow-2xl',
      gradient: 'bg-gradient-to-br from-white/70 to-orange-50/70 backdrop-blur-sm border border-orange-200/30 shadow-lg'
    }
    
    const hoverClasses = hover ? 
      'hover:shadow-2xl hover:-translate-y-3 hover:scale-[1.02] cursor-pointer hover:border-orange-300/70 hover:bg-white/80 transition-spring' : 
      ''
    
    const animationClasses = {
      none: '',
      fade: 'animate-fade-in',
      slide: 'animate-slide-in-up',
      scale: 'animate-scale-in',
      float: 'animate-float',
      bounce: 'animate-gentle-bounce'
    }
    
    const delayClass = delay > 0 ? `delay-[${delay}ms]` : ''
    
    return (
      <div
        className={cn(
          baseClasses,
          variants[variant],
          hoverClasses,
          animationClasses[animation],
          delayClass,
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
)

CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-xl font-semibold text-gray-800 leading-none tracking-tight', className)}
      {...props}
    />
  )
)

CardTitle.displayName = 'CardTitle'

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
)

CardContent.displayName = 'CardContent'

export { Card, CardHeader, CardTitle, CardContent }
export type { CardProps }
