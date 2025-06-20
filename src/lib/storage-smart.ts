import { uploadImageToS3 } from './storage-cloud'
import { saveFallbackImage } from './storage-fallback'

export async function smartImageUpload(
  imageUrl: string,
  folder: string = 'illustrations'
): Promise<{ url: string; storage: 's3' | 'local' | 'original' }> {
  
  // First, try S3 upload with shorter timeout for faster fallback
  try {
    console.log('Attempting S3 upload with smart fallback...')
    
    // Create a timeout promise to fail fast if S3 is not responding
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('S3 upload timeout - falling back to local storage')), 15000)
    })
    
    const s3UploadPromise = uploadImageToS3(imageUrl, folder)
    
    // Race between the upload and timeout
    const s3Url = await Promise.race([s3UploadPromise, timeoutPromise])
    console.log('✅ S3 upload successful')
    return { url: s3Url, storage: 's3' }
    
  } catch (s3Error: unknown) {
    const errorMessage = s3Error instanceof Error ? s3Error.message : 'Unknown S3 error'
    console.warn('⚠️ S3 upload failed, trying fallback storage:', errorMessage)
    
    // Try local fallback storage immediately
    try {
      console.log('🔄 Attempting local storage fallback...')
      const localUrl = await saveFallbackImage(imageUrl, folder)
      console.log('✅ Local storage fallback successful')
      return { url: localUrl, storage: 'local' }
    } catch (localError: unknown) {
      const localErrorMessage = localError instanceof Error ? localError.message : 'Unknown local storage error'
      console.warn('⚠️ Local storage also failed, using original URL:', localErrorMessage)
      
      // As absolute last resort, use the original image URL
      // This might be a temporary OpenAI URL, but it's better than failing completely
      console.log('🆘 Using original URL as last resort')
      return { url: imageUrl, storage: 'original' }
    }
  }
}

export async function testStorageConnectivity(): Promise<{
  s3Available: boolean
  localStorageAvailable: boolean
  recommendedStorage: 's3' | 'local'
}> {
  let s3Available = false
  let localStorageAvailable = false
  
  // Test S3 connectivity with faster timeout
  try {
    console.log('🔍 Testing S3 connectivity...')
    const testImageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    
    // Create timeout for faster failure detection
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('S3 connectivity test timeout')), 10000)
    })
    
    const s3TestPromise = uploadImageToS3(testImageUrl, 'connectivity-test')
    
    const result = await Promise.race([s3TestPromise, timeoutPromise])
    
    // Check if the result indicates successful S3 upload (not fallback)
    // We need to verify this is actually an S3 URL, not a local fallback
    if (result.includes('/uploads/')) {
      // This is a local fallback URL, so S3 is not really available
      console.log('❌ S3 test returned local fallback - S3 not available')
      s3Available = false
    } else {
      s3Available = true
      console.log('✅ S3 storage is available')
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.log('❌ S3 storage is not available:', errorMessage)
  }
  
  // Test local storage
  try {
    console.log('🔍 Testing local storage...')
    const testImageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    await saveFallbackImage(testImageUrl, 'connectivity-test')
    localStorageAvailable = true
    console.log('✅ Local storage is available')
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.log('❌ Local storage is not available:', errorMessage)
  }
  
  return {
    s3Available,
    localStorageAvailable,
    recommendedStorage: s3Available ? 's3' : 'local'
  }
}
