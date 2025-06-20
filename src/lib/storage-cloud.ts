import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid'
import { saveFallbackImage } from './storage-fallback'

// Alternative Wasabi endpoints for better connectivity
const WASABI_ENDPOINTS = [
  process.env.WASABI_ENDPOINT || 'https://s3.wasabisys.com',
  'https://s3.us-east-1.wasabisys.com',
  'https://s3.us-east-2.wasabisys.com',
  'https://s3.us-west-1.wasabisys.com',
  'https://s3.eu-central-1.wasabisys.com'
]

// Create S3 client with enhanced TLS configuration
function createS3Client(endpoint: string): S3Client {
  return new S3Client({
    region: process.env.WASABI_REGION!,
    endpoint,
    credentials: {
      accessKeyId: process.env.WASABI_ACCESS_KEY_ID!,
      secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
    requestHandler: {
      requestTimeout: 30000, // 30 second timeout
      connectionTimeout: 10000, // 10 second connection timeout
    },
    maxAttempts: 3, // Retry up to 3 times per endpoint
    retryMode: 'adaptive',
  })
}

// Try multiple endpoints for better connectivity
async function getWorkingS3Client(): Promise<{ client: S3Client; endpoint: string }> {
  for (const endpoint of WASABI_ENDPOINTS) {
    try {
      const client = createS3Client(endpoint)
      
      // Create a timeout promise for faster failure detection
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), 5000) // 5 second timeout
      })
      
      // Test the connection with a simple operation
      const testPromise = client.send(new GetObjectCommand({
        Bucket: process.env.WASABI_BUCKET_NAME!,
        Key: 'test-connectivity'
      })).catch(() => {
        // We expect this to fail (404), but it proves connectivity
        return null
      })
      
      await Promise.race([testPromise, timeoutPromise])
      console.log(`✅ Successfully connected to Wasabi endpoint: ${endpoint}`)
      return { client, endpoint }
    } catch (error) {
      console.warn(`❌ Failed to connect to endpoint ${endpoint}:`, (error as Error).message)
      continue
    }
  }
  throw new Error('Unable to connect to any Wasabi endpoints')
}

export async function uploadImageToS3(
  imageUrl: string,
  folder: string = 'illustrations'
): Promise<string> {
  let workingClient: S3Client | null = null
  let workingEndpoint: string | null = null
  
  // First try to get a working S3 client
  try {
    const clientInfo = await getWorkingS3Client()
    workingClient = clientInfo.client
    workingEndpoint = clientInfo.endpoint
  } catch (connectionError) {
    console.error('No Wasabi endpoints available:', connectionError)
    // Immediately fall back to local storage
    try {
      console.log('Using fallback local storage due to connection issues...')
      return await saveFallbackImage(imageUrl, folder)
    } catch (fallbackError) {
      console.error('Fallback storage also failed:', fallbackError)
      throw new Error('All storage options failed')
    }
  }

  const maxRetries = 3
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempting S3 upload to ${workingEndpoint} (attempt ${attempt}/${maxRetries})`)
      
      // Download the image from the URL with timeout
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000) // 15 second timeout for image download
      
      const response = await fetch(imageUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; StoryNest/1.0)'
        }
      })
      
      clearTimeout(timeout)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
      }
      
      const imageBuffer = await response.arrayBuffer()
      const fileName = `${folder}/${uuidv4()}.png`
      
      console.log(`Uploading to S3: ${fileName} (${imageBuffer.byteLength} bytes)`)
      
      // Upload to S3/Wasabi with retry logic built into the client
      const command = new PutObjectCommand({
        Bucket: process.env.WASABI_BUCKET_NAME!,
        Key: fileName,
        Body: Buffer.from(imageBuffer),
        ContentType: 'image/png',
        ACL: 'public-read',
      })
      
      await workingClient.send(command)
      
      // Return the public URL using the working endpoint
      const publicUrl = `${workingEndpoint}/${process.env.WASABI_BUCKET_NAME}/${fileName}`
      console.log(`Successfully uploaded to: ${publicUrl}`)
      return publicUrl
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      lastError = error instanceof Error ? error : new Error(String(error))
      console.error(`Upload attempt ${attempt} failed:`, errorMessage)
      
      // If this is the last attempt, break and try fallback
      if (attempt === maxRetries) {
        break
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.pow(2, attempt - 1) * 1000 // 1s, 2s, 4s delays
      console.log(`Waiting ${delay}ms before retry...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  console.error('All upload attempts failed. Last error:', lastError)
  
  // Try fallback local storage as last resort
  try {
    console.log('Attempting fallback local storage...')
    return await saveFallbackImage(imageUrl, folder)
  } catch (fallbackError) {
    console.error('Fallback storage also failed:', fallbackError)
    throw new Error(`Failed to upload image after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}. Fallback storage also failed.`)
  }
}

export async function getSignedImageUrl(key: string): Promise<string> {
  let workingClient: S3Client | null = null
  
  // Try to get a working S3 client
  try {
    const clientInfo = await getWorkingS3Client()
    workingClient = clientInfo.client
  } catch (connectionError) {
    console.error('No Wasabi endpoints available for signed URL:', connectionError)
    throw new Error('S3 storage unavailable for signed URL generation')
  }

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.WASABI_BUCKET_NAME!,
      Key: key,
    })
    
    const signedUrl = await getSignedUrl(workingClient, command, { expiresIn: 3600 })
    return signedUrl
  } catch (error) {
    console.error('Error generating signed URL:', error)
    throw new Error('Failed to generate signed URL')
  }
}

export async function uploadUserAvatar(imageFile: File, userId: string): Promise<string> {
  let workingClient: S3Client | null = null
  let workingEndpoint: string | null = null
  
  // First try to get a working S3 client
  try {
    const clientInfo = await getWorkingS3Client()
    workingClient = clientInfo.client
    workingEndpoint = clientInfo.endpoint
  } catch (connectionError) {
    console.error('No Wasabi endpoints available for avatar upload:', connectionError)
    throw new Error('S3 storage unavailable for avatar upload')
  }

  const maxRetries = 3
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempting to upload avatar to ${workingEndpoint} (attempt ${attempt}/${maxRetries})`)
      
      const fileName = `avatars/${userId}/${uuidv4()}.${imageFile.name.split('.').pop()}`
      
      const command = new PutObjectCommand({
        Bucket: process.env.WASABI_BUCKET_NAME!,
        Key: fileName,
        Body: Buffer.from(await imageFile.arrayBuffer()),
        ContentType: imageFile.type,
        ACL: 'public-read',
      })
      
      await workingClient.send(command)
      
      const publicUrl = `${workingEndpoint}/${process.env.WASABI_BUCKET_NAME}/${fileName}`
      console.log(`Successfully uploaded avatar to: ${publicUrl}`)
      return publicUrl
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      lastError = error instanceof Error ? error : new Error(String(error))
      console.error(`Avatar upload attempt ${attempt} failed:`, errorMessage)
      
      if (attempt === maxRetries) {
        break
      }
      
      const delay = Math.pow(2, attempt - 1) * 1000
      console.log(`Waiting ${delay}ms before retry...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  console.error('All avatar upload attempts failed. Last error:', lastError)
  throw new Error(`Failed to upload avatar after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`)
}
