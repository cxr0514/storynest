import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'
import { testStorageConnectivity } from '@/lib/storage-smart'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

// Enhanced logging for debugging
function log(level: 'info' | 'error' | 'warn', message: string, data?: unknown) {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] [AI-TEST] [${level.toUpperCase()}] ${message}`
  
  if (level === 'error') {
    console.error(logMessage, data || '')
  } else if (level === 'warn') {
    console.warn(logMessage, data || '')
  } else {
    console.log(logMessage, data || '')
  }
}

export async function GET() {
  const startTime = Date.now()
  
  try {
    log('info', 'Starting comprehensive AI API test')
    
    const results = {
      timestamp: new Date().toISOString(),
      tests: {} as Record<string, unknown>,
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
        duration: 0,
        overallStatus: 'UNKNOWN' as string
      }
    }

    // Test 1: Authentication Check
    log('info', 'Testing authentication')
    try {
      const session = await getServerSession(authOptions)
      results.tests.authentication = {
        status: session ? 'PASS' : 'INFO',
        hasSession: !!session,
        userId: session?.user?.id || null,
        userEmail: session?.user?.email || null,
        message: session ? 'User authenticated' : 'No session (optional for some endpoints)'
      }
      if (session) results.summary.passed++
      else results.summary.warnings++
    } catch (error) {
      results.tests.authentication = {
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Authentication check failed'
      }
      results.summary.failed++
    }
    results.summary.total++

    // Test 2: Database Connectivity
    log('info', 'Testing database connectivity')
    try {
      const userCount = await prisma.user.count()
      const storyCount = await prisma.story.count()
      const characterCount = await prisma.character.count()
      
      results.tests.database = {
        status: 'PASS',
        connected: true,
        stats: {
          users: userCount,
          stories: storyCount,
          characters: characterCount
        },
        message: 'Database connection successful'
      }
      results.summary.passed++
    } catch (error) {
      results.tests.database = {
        status: 'FAIL',
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Database connection failed'
      }
      results.summary.failed++
    }
    results.summary.total++

    // Test 3: OpenAI API Connectivity
    log('info', 'Testing OpenAI API connectivity')
    try {
      const testCompletion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a test assistant. Respond with exactly: "API_TEST_SUCCESS"' },
          { role: 'user', content: 'Test message' }
        ],
        max_tokens: 10,
        temperature: 0
      })
      
      const response = testCompletion.choices[0]?.message?.content
      const isSuccessful = response?.includes('API_TEST_SUCCESS')
      
      results.tests.openai_chat = {
        status: isSuccessful ? 'PASS' : 'WARN',
        connected: true,
        response: response,
        model: 'gpt-4o-mini',
        message: isSuccessful ? 'OpenAI Chat API working correctly' : 'API connected but unexpected response'
      }
      
      if (isSuccessful) results.summary.passed++
      else results.summary.warnings++
    } catch (error) {
      results.tests.openai_chat = {
        status: 'FAIL',
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'OpenAI Chat API test failed'
      }
      results.summary.failed++
    }
    results.summary.total++

    // Test 4: DALL-E Image Generation
    log('info', 'Testing DALL-E image generation')
    try {
      const testImage = await openai.images.generate({
        model: 'dall-e-3',
        prompt: 'A simple test image of a blue circle on white background',
        n: 1,
        size: '1024x1024',
        quality: 'standard'
      })
      
      const imageUrl = testImage.data?.[0]?.url
      
      results.tests.dalle_images = {
        status: imageUrl ? 'PASS' : 'FAIL',
        imageGenerated: !!imageUrl,
        imageUrl: imageUrl,
        model: 'dall-e-3',
        message: imageUrl ? 'DALL-E image generation working' : 'Image generation failed'
      }
      
      if (imageUrl) results.summary.passed++
      else results.summary.failed++
    } catch (error) {
      results.tests.dalle_images = {
        status: 'FAIL',
        imageGenerated: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'DALL-E image generation test failed'
      }
      results.summary.failed++
    }
    results.summary.total++

    // Test 5: Storage System Connectivity
    log('info', 'Testing storage system')
    try {
      const storageStatus = await testStorageConnectivity()
      
      results.tests.storage = {
        status: storageStatus.s3Available || storageStatus.localStorageAvailable ? 'PASS' : 'FAIL',
        s3Available: storageStatus.s3Available,
        localStorageAvailable: storageStatus.localStorageAvailable,
        recommendedStorage: storageStatus.recommendedStorage,
        message: `Storage test complete. Recommended: ${storageStatus.recommendedStorage}`
      }
      
      if (storageStatus.s3Available || storageStatus.localStorageAvailable) {
        results.summary.passed++
      } else {
        results.summary.failed++
      }
    } catch (error) {
      results.tests.storage = {
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Storage connectivity test failed'
      }
      results.summary.failed++
    }
    results.summary.total++

    // Test 6: Environment Variables
    log('info', 'Testing environment variables')
    const envTests = {
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
      WASABI_ACCESS_KEY_ID: !!process.env.WASABI_ACCESS_KEY_ID,
      WASABI_SECRET_ACCESS_KEY: !!process.env.WASABI_SECRET_ACCESS_KEY,
      WASABI_BUCKET_NAME: !!process.env.WASABI_BUCKET_NAME,
      WASABI_REGION: !!process.env.WASABI_REGION,
      WASABI_ENDPOINT: !!process.env.WASABI_ENDPOINT
    }
    
    const missingEnvVars = Object.entries(envTests).filter(([, value]) => !value).map(([key]) => key)
    const hasAllRequired = missingEnvVars.length === 0
    
    results.tests.environment = {
      status: hasAllRequired ? 'PASS' : 'WARN',
      allConfigured: hasAllRequired,
      configured: envTests,
      missing: missingEnvVars,
      message: hasAllRequired ? 'All environment variables configured' : `Missing: ${missingEnvVars.join(', ')}`
    }
    
    if (hasAllRequired) results.summary.passed++
    else results.summary.warnings++
    results.summary.total++

    // Final summary
    const duration = Date.now() - startTime
    results.summary.duration = duration
    results.summary.overallStatus = results.summary.failed === 0 ? 
      (results.summary.warnings === 0 ? 'HEALTHY' : 'HEALTHY_WITH_WARNINGS') : 
      'ISSUES_DETECTED'

    log('info', `API test completed in ${duration}ms: ${results.summary.passed}/${results.summary.total} passed`)

    return NextResponse.json(results, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    })

  } catch (error) {
    const duration = Date.now() - startTime
    log('error', `API test failed after ${duration}ms`, error)
    
    return NextResponse.json({
      success: false,
      error: 'API test encountered an unexpected error',
      duration,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { testType } = body as { testType?: string }
    
    log('info', `Running specific test: ${testType || 'all'}`)
    
    if (testType === 'chat') {
      // Test AI chat endpoint
      const chatResponse = await fetch(`${req.nextUrl.origin}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Test story idea about friendship' }]
        })
      })
      
      const chatResult = await chatResponse.json()
      
      return NextResponse.json({
        success: true,
        testType: 'chat',
        result: chatResult,
        status: chatResponse.status
      })
    }
    
    if (testType === 'storage') {
      // Test storage connectivity
      const storageResult = await testStorageConnectivity()
      
      return NextResponse.json({
        success: true,
        testType: 'storage',
        result: storageResult
      })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Unknown test type. Available: chat, storage'
    }, { status: 400 })
    
  } catch (error) {
    log('error', 'Specific test failed', error)
    return NextResponse.json({
      success: false,
      error: 'Test execution failed'
    }, { status: 500 })
  }
}
