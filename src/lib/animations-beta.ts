// Enhanced Animation Utilities for StoryNest Beta Phase
// Provides advanced animation classes and utilities for smooth UI transitions

export const fadeInUp = 'opacity-0 translate-y-4 transition-all duration-500 ease-out'
export const fadeInUpActive = 'opacity-100 translate-y-0'

export const fadeInLeft = 'opacity-0 -translate-x-4 transition-all duration-500 ease-out'
export const fadeInLeftActive = 'opacity-100 translate-x-0'

export const fadeInRight = 'opacity-0 translate-x-4 transition-all duration-500 ease-out'
export const fadeInRightActive = 'opacity-100 translate-x-0'

export const scaleIn = 'opacity-0 scale-95 transition-all duration-400 ease-out'
export const scaleInActive = 'opacity-100 scale-100'

export const slideInFromBottom = 'opacity-0 translate-y-8 transition-all duration-600 ease-out'
export const slideInFromBottomActive = 'opacity-100 translate-y-0'

// Staggered animation delays for lists and grids
export const staggerDelays = [
  'delay-0',
  'delay-75',
  'delay-150',
  'delay-225',
  'delay-300',
  'delay-[375ms]',
  'delay-[450ms]',
  'delay-[525ms]',
  'delay-[600ms]',
  'delay-[675ms]',
  'delay-[750ms]',
  'delay-[825ms]'
]

// Enhanced hover animations
export const hoverAnimations = {
  lift: 'hover:shadow-2xl hover:-translate-y-3 hover:scale-105 transition-all duration-300',
  gentle: 'hover:shadow-lg hover:-translate-y-1 transition-all duration-250',
  scale: 'hover:scale-105 transition-transform duration-200',
  glow: 'hover:shadow-lg hover:shadow-orange-200/50 transition-all duration-300',
  rotate: 'hover:rotate-1 transition-transform duration-200',
  bounce: 'hover:animate-bounce',
  pulse: 'hover:animate-pulse'
}

// Loading animations
export const loadingAnimations = {
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
  shimmer: 'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]',
  float: 'animate-[float_3s_ease-in-out_infinite]'
}

// Beta Phase Enhancement: Advanced Analytics Animations
export const analyticsAnimations = {
  scoreCountUp: 'transition-all duration-1000 ease-out',
  progressBar: 'transition-all duration-800 ease-out transform-gpu',
  consistencyPulse: 'animate-pulse duration-2000',
  insightSlideIn: 'opacity-0 translate-x-full transition-all duration-500 ease-out',
  insightSlideInActive: 'opacity-100 translate-x-0',
  metricCard: 'hover:shadow-xl hover:scale-102 transition-all duration-300 transform-gpu',
  chartAnimation: 'opacity-0 scale-95 transition-all duration-600 ease-out delay-200',
  chartAnimationActive: 'opacity-100 scale-100'
}

// Beta Phase Enhancement: Character Form Animations
export const characterFormAnimations = {
  tabSlide: 'transition-all duration-400 ease-out transform-gpu',
  traitSelect: 'hover:scale-105 hover:shadow-md transition-all duration-200 transform-gpu',
  traitSelected: 'scale-105 shadow-lg bg-gradient-to-r from-orange-100 to-rose-100',
  formSection: 'opacity-0 translate-y-4 transition-all duration-300 ease-out',
  formSectionActive: 'opacity-100 translate-y-0',
  validation: 'animate-shake duration-500',
  success: 'animate-bounce duration-600'
}

// Beta Phase Enhancement: Real-time Feedback Animations
export const feedbackAnimations = {
  notification: {
    enter: 'opacity-0 translate-y-2 scale-95 transition-all duration-200 ease-out',
    enterActive: 'opacity-100 translate-y-0 scale-100',
    exit: 'opacity-100 scale-100 transition-all duration-150 ease-in',
    exitActive: 'opacity-0 scale-95 translate-y-2'
  },
  consistencyBadge: {
    excellent: 'bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse',
    good: 'bg-gradient-to-r from-blue-400 to-cyan-500',
    needs_improvement: 'bg-gradient-to-r from-yellow-400 to-orange-500 animate-bounce'
  },
  loading: {
    skeleton: 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]',
    dots: 'animate-bounce delay-0, animate-bounce delay-150, animate-bounce delay-300'
  }
}

// Beta Phase Enhancement: Advanced Page Transitions
export const pageTransitions = {
  fadeIn: 'animate-[fadeIn_0.5s_ease-out]',
  slideInRight: 'animate-[slideInRight_0.5s_ease-out]',
  slideInLeft: 'animate-[slideInLeft_0.5s_ease-out]',
  slideInUp: 'animate-[slideInUp_0.6s_ease-out]',
  // Enhanced Beta transitions
  slideNext: {
    enter: 'opacity-0 translate-x-full transition-all duration-400 ease-out',
    enterActive: 'opacity-100 translate-x-0',
    exit: 'opacity-100 translate-x-0 transition-all duration-400 ease-in',
    exitActive: 'opacity-0 -translate-x-full'
  },
  slidePrev: {
    enter: 'opacity-0 -translate-x-full transition-all duration-400 ease-out',
    enterActive: 'opacity-100 translate-x-0',
    exit: 'opacity-100 translate-x-0 transition-all duration-400 ease-in',
    exitActive: 'opacity-0 translate-x-full'
  },
  fadeThrough: {
    enter: 'opacity-0 scale-95 transition-all duration-300 ease-out delay-150',
    enterActive: 'opacity-100 scale-100',
    exit: 'opacity-100 scale-100 transition-all duration-150 ease-in',
    exitActive: 'opacity-0 scale-105'
  }
}

// Beta Phase Enhancement: Micro-interaction Animations
export const microAnimations = {
  buttonPress: 'active:scale-95 transition-transform duration-100',
  iconHover: 'hover:rotate-12 hover:scale-110 transition-all duration-200',
  cardHover: 'hover:shadow-2xl hover:-translate-y-2 hover:rotate-1 transition-all duration-300',
  inputFocus: 'focus:ring-4 focus:ring-orange-200 focus:border-orange-400 transition-all duration-200',
  tagSelect: 'hover:bg-orange-100 hover:scale-105 active:scale-95 transition-all duration-150',
  ripple: 'relative overflow-hidden before:absolute before:inset-0 before:bg-white before:opacity-0 before:scale-0 before:rounded-full before:transition-all before:duration-300 active:before:opacity-20 active:before:scale-100'
}

// Interactive button animations
export const buttonAnimations = {
  primary: 'transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95',
  secondary: 'transition-all duration-200 hover:bg-gray-50 hover:shadow-md active:scale-95',
  destructive: 'transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95',
  ghost: 'transition-all duration-200 hover:bg-gray-100 active:scale-95'
}

// Beta Phase Enhancement: Staggered Animation Utilities
export const createStaggeredAnimation = (baseClass: string, itemCount: number, delay: number = 100) => {
  return Array.from({ length: itemCount }, (_, index) => 
    `${baseClass} delay-[${index * delay}ms]`
  )
}

export const getStaggerDelay = (index: number, baseDelay: number = 100) => {
  return `delay-[${index * baseDelay}ms]`
}

// Beta Phase Enhancement: Character Consistency Visual Feedback
export const consistencyAnimations = {
  scoreBar: (score: number) => {
    const color = score >= 80 ? 'from-green-400 to-emerald-500' :
                  score >= 60 ? 'from-blue-400 to-cyan-500' :
                  'from-yellow-400 to-orange-500'
    return `bg-gradient-to-r ${color} transition-all duration-1000 ease-out transform-gpu`
  },
  
  trendIndicator: (trend: 'improving' | 'stable' | 'declining') => {
    const baseClass = 'transition-all duration-500 transform-gpu'
    switch (trend) {
      case 'improving':
        return `${baseClass} text-green-600 animate-bounce`
      case 'declining':
        return `${baseClass} text-red-600 animate-pulse`
      default:
        return `${baseClass} text-blue-600`
    }
  },
  
  metricUpdate: 'transition-all duration-800 ease-out transform-gpu animate-pulse'
}

// Beta Phase Enhancement: Advanced Loading States
export const betaLoadingStates = {
  analyticsCards: 'bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded-xl h-32',
  characterForm: 'bg-gradient-to-r from-orange-50 via-orange-100 to-orange-50 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded-lg h-8',
  insightCards: 'bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 bg-[length:200%_100%] animate-[shimmer_2.5s_ease-in-out_infinite] rounded-lg h-24'
}

// Animation timing functions
export const easingFunctions = {
  easeInOut: 'ease-in-out',
  easeOut: 'ease-out',
  easeIn: 'ease-in',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
}

// Utility function to combine animation classes
export const combineAnimations = (...animations: string[]) => {
  return animations.filter(Boolean).join(' ')
}

// Scroll Animation Observer for intersection-based animations
class ScrollAnimationObserver {
  private observer: IntersectionObserver
  private elementMap = new Map<Element, { animationClass: string; activeClass: string }>()

  constructor() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const elementData = this.elementMap.get(entry.target)
          if (!elementData) return

          if (entry.isIntersecting) {
            entry.target.classList.remove(elementData.animationClass)
            entry.target.classList.add(elementData.activeClass)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      }
    )
  }

  observe(element: Element, animationClass: string, activeClass: string) {
    this.elementMap.set(element, { animationClass, activeClass })
    element.classList.add(animationClass)
    this.observer.observe(element)
  }

  unobserve(element: Element) {
    this.elementMap.delete(element)
    this.observer.unobserve(element)
  }

  disconnect() {
    this.observer.disconnect()
    this.elementMap.clear()
  }
}

// Hook for using scroll animations
export const useScrollAnimation = () => {
  let observer: ScrollAnimationObserver | null = null

  const initializeObserver = () => {
    if (!observer) {
      observer = new ScrollAnimationObserver()
    }
    return observer
  }

  const observeElement = (
    element: Element | null, 
    animationClass: string, 
    activeClass: string
  ) => {
    if (element) {
      const obs = initializeObserver()
      obs.observe(element, animationClass, activeClass)
    }
  }

  const cleanup = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  return { observeElement, cleanup }
}

const animationsBeta = {
  fadeInUp,
  fadeInUpActive,
  fadeInLeft,
  fadeInLeftActive,
  fadeInRight,
  fadeInRightActive,
  scaleIn,
  scaleInActive,
  slideInFromBottom,
  slideInFromBottomActive,
  staggerDelays,
  hoverAnimations,
  loadingAnimations,
  pageTransitions,
  buttonAnimations,
  analyticsAnimations,
  characterFormAnimations,
  feedbackAnimations,
  microAnimations,
  createStaggeredAnimation,
  getStaggerDelay,
  consistencyAnimations,
  betaLoadingStates,
  easingFunctions,
  combineAnimations,
  ScrollAnimationObserver,
  useScrollAnimation
}

export default animationsBeta
