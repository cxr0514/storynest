/**
 * API Request Logging Middleware for StoryNest
 * This middleware automatically logs all API requests and responses
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

// Middleware function to wrap API routes with logging
export function withLogging(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now()
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const { method, url, headers } = req
    const userAgent = headers.get('user-agent') || 'unknown'
    
    // Log incoming request
    logger.request(method, url, { 
      requestId, 
      userAgent,
      timestamp: new Date().toISOString()
    })

    try {
      // Execute the handler
      const response = await handler(req)
      const duration = Date.now() - startTime
      
      // Log successful response
      logger.response(method, url, response.status, duration, { 
        requestId,
        success: response.status < 400
      })
      
      return response
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Log error response
      logger.error(`API Error in ${method} ${url}`, error, { 
        requestId, 
        duration: `${duration}ms`,
        method,
        url
      })
      
      // Return generic error response
      return NextResponse.json(
        { 
          success: false, 
          error: 'Internal server error',
          requestId 
        },
        { status: 500 }
      )
    }
  }
}

// Helper function to log API events within handlers
export function createApiLogger(endpoint: string) {
  return {
    info: (message: string, context?: any) => logger.api(`[${endpoint}] ${message}`, context),
    error: (message: string, error?: any, context?: any) => logger.error(`[${endpoint}] ${message}`, error, context),
    warn: (message: string, context?: any) => logger.warn(`[${endpoint}] ${message}`, context),
    success: (message: string, context?: any) => logger.success(`[${endpoint}] ${message}`, context),
    ai: (message: string, context?: any) => logger.ai(`[${endpoint}] ${message}`, context),
    performance: (operation: string, startTime: number, context?: any) => 
      logger.performance(`[${endpoint}] ${operation}`, startTime, context)
  }
}

export default withLogging
