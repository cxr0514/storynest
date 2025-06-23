import { v4 as uuidv4 } from 'uuid'
import { saveFallbackImage } from './storage-fallback'

// Dynamic AWS SDK import to handle module loading issues
let awsSDK: any = null
let awsSDKError: Error | null = null

async function getAWSSDK() {
  if (awsSDK) return awsSDK
  if (awsSDKError) throw awsSDKError
  
  try {
    const [s3Module, presignerModule] = await Promise.all([
      import('@aws-sdk/client-s3'),
      import('@aws-sdk/s3-request-presigner')
    ])
    
    awsSDK = {
      S3Client: s3Module.S3Client,
      PutObjectCommand: s3Module.PutObjectCommand,
      GetObjectCommand: s3Module.GetObjectCommand,
      getSignedUrl: presignerModule.getSignedUrl
    }
    
    return awsSDK
  } catch (error) {
    awsSDKError = error as Error
    console.error('Failed to load AWS SDK:', error)
    throw new Error(`AWS SDK unavailable: ${(error as Error).message}`)
  }
}

// Alternative Wasabi endpoints for better connectivity
const WASABI_ENDPOINTS = [
  process.env.WASABI_ENDPOINT || 'https://s3.wasabisys.com',
  'https://s3.us-east-1.wasabisys.com',
  'https://s3.us-east-2.wasabisys.com',
  'https://s3.us-west-1.wasabisys.com',
  'https://s3.eu-central-1.wasabisys.com'
]

// Create S3 client with enhanced TLS configuration
async function createS3Client(endpoint: string) {
  const aws = await getAWSSDK()
  
  return new aws.S3Client({
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
async function getWorkingS3Client(): Promise<{ client: any; endpoint: string; aws: any }> {
  const aws = await getAWSSDK()
  
  for (const endpoint of WASABI_ENDPOINTS) {
    try {
      const client = await createS3Client(endpoint)
      
      // Create a timeout promise for faster failure detection
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), 5000) // 5 second timeout
      })
      
      // Test the connection with a simple operation
      const testPromise = client.send(new aws.GetObjectCommand({
        Bucket: process.env.WASABI_BUCKET_NAME!,
        Key: 'test-connectivity'
      })).catch(() => {
        // We expect this to fail (404), but it proves connectivity
        return null
      })
      
      await Promise.race([testPromise, timeoutPromise])
      console.log(`✅ Successfully connected to Wasabi endpoint: ${endpoint}`)
      return { client, endpoint, aws }
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
  let workingClient: any = null
  let workingEndpoint: string | null = null
  let aws: any = null
  
  // First try to get a working S3 client
  try {
    const clientInfo = await getWorkingS3Client()
    workingClient = clientInfo.client
    workingEndpoint = clientInfo.endpoint
    aws = clientInfo.aws
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
          'User-Agent': 'StoryNest/1.0 (Image downloader)'
        }
      })
      
      clearTimeout(timeout)
      
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status} ${response.statusText}`)
      }

      const buffer = await response.arrayBuffer()
      const fileName = `${folder}/${uuidv4()}.png`

      // Upload to S3/Wasabi with retry logic built into the client
      const uploadCommand = new aws.PutObjectCommand({
        Bucket: process.env.WASABI_BUCKET_NAME!,
        Key: fileName,
        Body: new Uint8Array(buffer),
        ContentType: 'image/png',
        // Add some metadata for tracking
        Metadata: {
          'uploaded-at': new Date().toISOString(),
          'source': 'storynest-app',
          'original-url': imageUrl.substring(0, 200) // Truncate to avoid metadata limits
        }
      })

      const result = await workingClient.send(uploadCommand)
      console.log(`✅ Successfully uploaded to S3: ${fileName}`)

      // Generate a signed URL for the uploaded file
      const signedUrl = await aws.getSignedUrl(workingClient, new aws.GetObjectCommand({
        Bucket: process.env.WASABI_BUCKET_NAME!,
        Key: fileName,
      }), { expiresIn: 86400 }) // 24 hours expiry

      return signedUrl

    } catch (error) {
      lastError = error as Error
      console.error(`❌ S3 upload attempt ${attempt} failed:`, lastError.message)
      
      if (attempt === maxRetries) {
        console.log('All S3 attempts failed, falling back to local storage...')
        try {
          return await saveFallbackImage(imageUrl, folder)
        } catch (fallbackError) {
          console.error('Fallback storage also failed:', fallbackError)
          throw new Error('All storage options failed')
        }
      } else {
        // Wait before retrying (exponential backoff)
        const waitTime = Math.pow(2, attempt) * 1000
        console.log(`⏳ Waiting ${waitTime}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
  }

  throw new Error(`Failed to upload image after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`)
}

export async function getSignedImageUrl(key: string): Promise<string> {
  try {
    const { client, aws } = await getWorkingS3Client()
    
    const command = new aws.GetObjectCommand({
      Bucket: process.env.WASABI_BUCKET_NAME!,
      Key: key,
    })

    const signedUrl = await aws.getSignedUrl(client, command, { expiresIn: 86400 }) // 24 hours
    return signedUrl
  } catch (error) {
    console.error('Failed to generate signed URL:', error)
    throw error
  }
}

export async function uploadUserAvatar(imageFile: File, userId: string): Promise<string> {
  let workingClient: any = null
  let workingEndpoint: string | null = null
  let aws: any = null
  
  try {
    const clientInfo = await getWorkingS3Client()
    workingClient = clientInfo.client
    workingEndpoint = clientInfo.endpoint
    aws = clientInfo.aws
  } catch (connectionError) {
    console.error('No Wasabi endpoints available for avatar upload:', connectionError)
    throw new Error('Cloud storage unavailable for avatar upload')
  }

  const maxRetries = 3
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempting avatar upload to ${workingEndpoint} (attempt ${attempt}/${maxRetries})`)
      
      const buffer = await imageFile.arrayBuffer()
      const fileName = `avatars/${userId}/${uuidv4()}.${imageFile.type.split('/')[1] || 'png'}`

      const uploadCommand = new aws.PutObjectCommand({
        Bucket: process.env.WASABI_BUCKET_NAME!,
        Key: fileName,
        Body: new Uint8Array(buffer),
        ContentType: imageFile.type,
        Metadata: {
          'uploaded-at': new Date().toISOString(),
          'source': 'storynest-avatar',
          'user-id': userId
        }
      })

      await workingClient.send(uploadCommand)
      console.log(`✅ Successfully uploaded avatar: ${fileName}`)

      // Generate a signed URL for the uploaded avatar
      const signedUrl = await aws.getSignedUrl(workingClient, new aws.GetObjectCommand({
        Bucket: process.env.WASABI_BUCKET_NAME!,
        Key: fileName,
      }), { expiresIn: 86400 }) // 24 hours expiry

      return signedUrl

    } catch (error) {
      lastError = error as Error
      console.error(`❌ Avatar upload attempt ${attempt} failed:`, lastError.message)
      
      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        const waitTime = Math.pow(2, attempt) * 1000
        console.log(`⏳ Waiting ${waitTime}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
  }

  throw new Error(`Failed to upload avatar after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`)
}
