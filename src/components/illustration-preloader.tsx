// Image Preloader for Enhanced Illustration Performance
// Preloads images for smoother story reading experience

import { useEffect, useState } from 'react'
import { SegmentAnalytics } from '@/lib/segment-analytics'

interface IllustrationPreloaderProps {
  illustrations: Array<{
    id: string
    url: string
    pageNumber: number
  }>
  currentPage: number
  userId?: string
  childProfileId?: string
  storyId?: string
  deviceType?: string
}

export function IllustrationPreloader({
  illustrations,
  currentPage,
  userId,
  childProfileId,
  storyId,
  deviceType
}: IllustrationPreloaderProps) {
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set())
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Preload current page and next 2 pages
    const pagesToPreload = [currentPage, currentPage + 1, currentPage + 2]
    
    pagesToPreload.forEach(pageIndex => {
      const illustration = illustrations[pageIndex]
      if (illustration && !preloadedImages.has(illustration.id) && !loadingImages.has(illustration.id)) {
        preloadImage(illustration)
      }
    })
  }, [currentPage, illustrations, preloadedImages, loadingImages])

  const preloadImage = async (illustration: { id: string; url: string; pageNumber: number }) => {
    if (preloadedImages.has(illustration.id) || loadingImages.has(illustration.id)) {
      return
    }

    setLoadingImages(prev => new Set(prev).add(illustration.id))
    const startTime = performance.now()

    try {
      await new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          const loadTime = Math.round(performance.now() - startTime)
          
          // Track successful preload
          if (userId && childProfileId && storyId && deviceType) {
            SegmentAnalytics.track('Illustration Preloaded', {
              userId,
              childProfileId,
              storyId,
              pageNumber: illustration.pageNumber,
              illustrationId: illustration.id,
              loadTime,
              deviceType,
              preloadDistance: illustration.pageNumber - currentPage
            })
          }
          
          setPreloadedImages(prev => new Set(prev).add(illustration.id))
          setLoadingImages(prev => {
            const newSet = new Set(prev)
            newSet.delete(illustration.id)
            return newSet
          })
          resolve()
        }
        
        img.onerror = () => {
          // Track preload failure
          if (userId && childProfileId && storyId) {
            SegmentAnalytics.track('Illustration Preload Failed', {
              userId,
              childProfileId,
              storyId,
              pageNumber: illustration.pageNumber,
              illustrationId: illustration.id,
              error: 'Preload failed'
            })
          }
          
          setLoadingImages(prev => {
            const newSet = new Set(prev)
            newSet.delete(illustration.id)
            return newSet
          })
          reject(new Error('Image preload failed'))
        }
        
        img.src = illustration.url
      })
    } catch (error) {
      console.warn('Failed to preload illustration:', illustration.id, error)
    }
  }

  // This component doesn't render anything, it just preloads images
  return null
}

// Hook for image preloading with performance tracking
export function useImagePreloader() {
  const [preloadedUrls, setPreloadedUrls] = useState<Set<string>>(new Set())

  const preloadImages = async (urls: string[], priority: 'high' | 'low' = 'low') => {
    const promises = urls
      .filter(url => !preloadedUrls.has(url))
      .map(async (url) => {
        try {
          await new Promise<void>((resolve, reject) => {
            const img = new Image()
            if (priority === 'high') {
              img.loading = 'eager'
            }
            img.onload = () => {
              setPreloadedUrls(prev => new Set(prev).add(url))
              resolve()
            }
            img.onerror = reject
            img.src = url
          })
        } catch (error) {
          console.warn('Failed to preload image:', url, error)
        }
      })

    return Promise.allSettled(promises)
  }

  const isPreloaded = (url: string) => preloadedUrls.has(url)

  return { preloadImages, isPreloaded, preloadedCount: preloadedUrls.size }
}

// Performance-optimized Image component wrapper
interface OptimizedImageProps {
  src: string
  alt: string
  onLoad?: () => void
  onError?: (error: Event) => void
  priority?: boolean
  className?: string
  fill?: boolean
  sizes?: string
  trackingProps?: {
    userId: string
    illustrationId: string
    pageNumber: number
  }
}

export function OptimizedImage({
  src,
  alt,
  onLoad,
  onError,
  priority = false,
  className = '',
  fill = false,
  sizes,
  trackingProps
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false)
  const [loadStartTime] = useState(performance.now())

  const handleLoad = () => {
    const loadTime = Math.round(performance.now() - loadStartTime)
    
    // Track image load performance
    if (trackingProps) {
      SegmentAnalytics.track('Image Load Performance', {
        ...trackingProps,
        loadTime,
        imageSize: src.length,
        imageUrl: src
      })
    }
    
    onLoad?.()
  }

  const handleError = (error: Event) => {
    setImageError(true)
    
    // Track image load error
    if (trackingProps) {
      SegmentAnalytics.track('Image Load Error', {
        ...trackingProps,
        error: 'Image failed to load',
        imageUrl: src
      })
    }
    
    onError?.(error)
  }

  if (imageError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-2xl mb-2">🖼️</div>
          <div className="text-sm">Image unavailable</div>
        </div>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onLoad={handleLoad}
      onError={handleError}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      style={fill ? { width: '100%', height: '100%', objectFit: 'cover' } : undefined}
      sizes={sizes}
    />
  )
}
