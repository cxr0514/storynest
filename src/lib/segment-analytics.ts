// Segment Analytics Integration for StoryNest
// Comprehensive event tracking for reading progress and user engagement

// Segment Analytics Integration
declare global {
  interface Window {
    analytics?: {
      track: (event: string, properties?: Record<string, any>) => void
      identify: (userId: string, traits?: Record<string, any>) => void
      page: (name?: string, properties?: Record<string, any>) => void
      group: (groupId: string, traits?: Record<string, any>) => void
    }
  }
}

// Segment Analytics Events
export const SegmentEvents = {
  // Reading Progress Events
  STORY_READING_STARTED: 'Story Reading Started',
  STORY_READING_PROGRESS: 'Story Reading Progress',
  STORY_READING_COMPLETED: 'Story Reading Completed',
  STORY_PAGE_VIEWED: 'Story Page Viewed',
  
  // Illustration Events
  ILLUSTRATION_VIEWED: 'Illustration Viewed',
  ILLUSTRATION_GENERATION_REQUESTED: 'Illustration Generation Requested',
  ILLUSTRATION_GENERATION_COMPLETED: 'Illustration Generation Completed',
  ILLUSTRATION_GENERATION_FAILED: 'Illustration Generation Failed',
  
  // Character Events
  CHARACTER_CREATED: 'Character Created',
  CHARACTER_UPDATED: 'Character Updated',
  CHARACTER_USED_IN_STORY: 'Character Used In Story',
  
  // Story Events
  STORY_CREATED: 'Story Created',
  STORY_GENERATION_STARTED: 'Story Generation Started',
  STORY_GENERATION_COMPLETED: 'Story Generation Completed',
  STORY_GENERATION_FAILED: 'Story Generation Failed',
  
  // User Engagement Events
  SESSION_STARTED: 'Session Started',
  SESSION_ENDED: 'Session Ended',
  CHILD_PROFILE_CREATED: 'Child Profile Created',
  CHILD_PROFILE_SELECTED: 'Child Profile Selected'
} as const

// Segment Analytics Helper Class
export class SegmentAnalytics {
  private static isEnabled(): boolean {
    return typeof window !== 'undefined' && !!window.analytics
  }

  static track(event: string, properties?: Record<string, any>): void {
    if (this.isEnabled()) {
      try {
        window.analytics!.track(event, {
          timestamp: new Date().toISOString(),
          ...properties
        })
      } catch (error) {
        console.warn('Segment analytics error:', error)
      }
    }
  }

  static identify(userId: string, traits?: Record<string, any>): void {
    if (this.isEnabled()) {
      try {
        window.analytics!.identify(userId, traits)
      } catch (error) {
        console.warn('Segment identify error:', error)
      }
    }
  }

  static page(name?: string, properties?: Record<string, any>): void {
    if (this.isEnabled()) {
      try {
        window.analytics!.page(name, properties)
      } catch (error) {
        console.warn('Segment page error:', error)
      }
    }
  }

  // Reading Progress Tracking
  static trackReadingStarted(props: {
    userId: string
    childProfileId: string
    storyId: string
    totalPages: number
    deviceType: string
    sessionId: string
  }): void {
    this.track(SegmentEvents.STORY_READING_STARTED, props)
  }

  static trackReadingProgress(props: {
    userId: string
    childProfileId: string
    storyId: string
    currentPage: number
    totalPages: number
    progressPercent: number
    timeSpent: number
    deviceType: string
    sessionId: string
  }): void {
    this.track(SegmentEvents.STORY_READING_PROGRESS, props)
  }

  static trackReadingCompleted(props: {
    userId: string
    childProfileId: string
    storyId: string
    totalPages: number
    totalTimeSpent: number
    deviceType: string
    sessionId: string
  }): void {
    this.track(SegmentEvents.STORY_READING_COMPLETED, props)
  }

  static trackPageViewed(props: {
    userId: string
    childProfileId: string
    storyId: string
    pageNumber: number
    hasIllustration: boolean
    timeOnPage: number
    deviceType: string
    sessionId: string
  }): void {
    this.track(SegmentEvents.STORY_PAGE_VIEWED, props)
  }

  // Illustration Tracking
  static trackIllustrationViewed(props: {
    userId: string
    childProfileId: string
    storyId: string
    pageNumber: number
    illustrationId: string
    loadTime: number
    deviceType: string
  }): void {
    this.track(SegmentEvents.ILLUSTRATION_VIEWED, props)
  }

  static trackIllustrationGeneration(props: {
    userId: string
    childProfileId: string
    storyId: string
    pageNumber: number
    prompt: string
    success: boolean
    generationTime?: number
    error?: string
  }): void {
    const event = props.success 
      ? SegmentEvents.ILLUSTRATION_GENERATION_COMPLETED 
      : SegmentEvents.ILLUSTRATION_GENERATION_FAILED
    
    this.track(event, props)
  }

  // Character Tracking
  static trackCharacterEvent(event: string, props: {
    userId: string
    childProfileId: string
    characterId: string
    characterName: string
    [key: string]: any
  }): void {
    this.track(event, props)
  }

  // Story Tracking
  static trackStoryEvent(event: string, props: {
    userId: string
    childProfileId: string
    storyId: string
    theme?: string
    characterCount?: number
    [key: string]: any
  }): void {
    this.track(event, props)
  }

  // Session Tracking
  static trackSessionStarted(props: {
    userId: string
    childProfileId?: string
    deviceType: string
    sessionId: string
  }): void {
    this.track(SegmentEvents.SESSION_STARTED, props)
  }

  static trackSessionEnded(props: {
    userId: string
    sessionId: string
    sessionDuration: number
    pagesViewed: number
    storiesRead: number
  }): void {
    this.track(SegmentEvents.SESSION_ENDED, props)
  }
}

// Utility function to detect device type
export function getDeviceType(): string {
  if (typeof window === 'undefined') return 'unknown'
  
  const userAgent = navigator.userAgent
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    return 'tablet'
  }
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
    return 'mobile'
  }
  return 'desktop'
}

// Utility function to generate session ID
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Performance measurement utilities
export class PerformanceTracker {
  private static measurements: Map<string, number> = new Map()

  static startMeasurement(key: string): void {
    this.measurements.set(key, performance.now())
  }

  static endMeasurement(key: string): number {
    const startTime = this.measurements.get(key)
    if (!startTime) return 0
    
    const duration = performance.now() - startTime
    this.measurements.delete(key)
    return Math.round(duration)
  }

  static measureAsync<T>(key: string, fn: () => Promise<T>): Promise<T & { duration: number }> {
    return new Promise(async (resolve, reject) => {
      this.startMeasurement(key)
      try {
        const result = await fn()
        const duration = this.endMeasurement(key)
        resolve({ ...result, duration } as T & { duration: number })
      } catch (error) {
        this.endMeasurement(key)
        reject(error)
      }
    })
  }
}
