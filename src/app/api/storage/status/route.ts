import { NextResponse } from 'next/server'
import { testStorageConnectivity } from '@/lib/storage-smart'

export async function GET() {
  try {
    console.log('🔍 Running storage connectivity check...')
    
    const connectivity = await testStorageConnectivity()
    
    const status = {
      timestamp: new Date().toISOString(),
      s3Available: connectivity.s3Available,
      localStorageAvailable: connectivity.localStorageAvailable,
      recommendedStorage: connectivity.recommendedStorage,
      status: connectivity.localStorageAvailable ? 'operational' : 'degraded'
    }
    
    console.log('Storage status:', status)
    
    return NextResponse.json(status)
    
  } catch (error) {
    console.error('Storage connectivity check failed:', error)
    
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        s3Available: false,
        localStorageAvailable: false,
        recommendedStorage: 'local',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
