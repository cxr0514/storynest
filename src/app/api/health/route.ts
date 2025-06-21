import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export async function GET() {
  const startTime = Date.now()
  const requestId = `health-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  try {
    logger.api('Health check requested', { requestId })
    
    const response = { 
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Server is running',
      requestId,
      logging: {
        active: true,
        logLevel: process.env.LOG_LEVEL,
        verboseLogging: process.env.VERBOSE_LOGGING === 'true',
        features: {
          apiRequests: process.env.LOG_API_REQUESTS === 'true',
          oauthFlows: process.env.LOG_OAUTH_FLOWS === 'true',
          aiInteractions: process.env.LOG_AI_INTERACTIONS === 'true',
          databaseQueries: process.env.LOG_DATABASE_QUERIES === 'true'
        }
      }
    }
    
    logger.performance('Health check', startTime, { requestId })
    logger.success('Health check completed successfully', { requestId })
    
    return NextResponse.json(response)
  } catch (error) {
    logger.error('Health check failed', error, { requestId })
    return NextResponse.json({ 
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      requestId
    }, { status: 500 })
  }
}
