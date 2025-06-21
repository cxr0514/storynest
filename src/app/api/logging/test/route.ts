import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export async function GET(req: NextRequest) {
  const startTime = Date.now()
  const requestId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  logger.api('Logging test endpoint accessed', { requestId })
  
  // Test all logging levels
  logger.debug('Debug message test', { requestId, level: 'debug' })
  logger.info('Info message test', { requestId, level: 'info' })
  logger.warn('Warning message test', { requestId, level: 'warn' })
  logger.success('Success message test', { requestId, level: 'success' })
  
  // Test specialized logging
  logger.oauth('OAuth flow test', { requestId, action: 'test' })
  logger.ai('AI interaction test', { requestId, model: 'test' })
  logger.database('Database query test', { requestId, query: 'SELECT 1' })
  
  // Test performance logging
  logger.performance('Test operation', startTime, { requestId })
  
  const response = {
    success: true,
    message: 'Enhanced logging system is active!',
    timestamp: new Date().toISOString(),
    requestId,
    tests: {
      debug: '🐛 Debug logging',
      info: 'ℹ️  Info logging', 
      warn: '⚠️  Warning logging',
      error: '❌ Error logging',
      success: '✅ Success logging',
      oauth: '🔐 OAuth logging',
      ai: '🤖 AI interaction logging',
      database: '🗄️  Database logging',
      performance: '⚡ Performance logging'
    },
    configuration: {
      logLevel: process.env.LOG_LEVEL,
      verboseLogging: process.env.VERBOSE_LOGGING,
      logOauthFlows: process.env.LOG_OAUTH_FLOWS,
      logApiRequests: process.env.LOG_API_REQUESTS,
      logDatabaseQueries: process.env.LOG_DATABASE_QUERIES,
      logAiInteractions: process.env.LOG_AI_INTERACTIONS
    }
  }
  
  logger.success('Logging test completed successfully', { requestId, duration: Date.now() - startTime })
  
  return NextResponse.json(response)
}
