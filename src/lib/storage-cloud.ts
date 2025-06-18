import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid'

const s3Client = new S3Client({
  region: process.env.WASABI_REGION!,
  endpoint: process.env.WASABI_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.WASABI_ACCESS_KEY_ID!,
    secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
})

export async function uploadImageToS3(
  imageUrl: string,
  folder: string = 'illustrations'
): Promise<string> {
  try {
    // Download the image from the URL
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error('Failed to fetch image')
    }
    
    const imageBuffer = await response.arrayBuffer()
    const fileName = `${folder}/${uuidv4()}.png`
    
    // Upload to S3/Wasabi
    const command = new PutObjectCommand({
      Bucket: process.env.WASABI_BUCKET_NAME!,
      Key: fileName,
      Body: Buffer.from(imageBuffer),
      ContentType: 'image/png',
      ACL: 'public-read',
    })
    
    await s3Client.send(command)
    
    // Return the public URL
    return `${process.env.WASABI_ENDPOINT}/${process.env.WASABI_BUCKET_NAME}/${fileName}`
  } catch (error) {
    console.error('Error uploading to S3:', error)
    throw new Error('Failed to upload image')
  }
}

export async function getSignedImageUrl(key: string): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.WASABI_BUCKET_NAME!,
      Key: key,
    })
    
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
    return signedUrl
  } catch (error) {
    console.error('Error generating signed URL:', error)
    throw new Error('Failed to generate signed URL')
  }
}

export async function uploadUserAvatar(imageFile: File, userId: string): Promise<string> {
  try {
    const fileName = `avatars/${userId}/${uuidv4()}.${imageFile.name.split('.').pop()}`
    
    const command = new PutObjectCommand({
      Bucket: process.env.WASABI_BUCKET_NAME!,
      Key: fileName,
      Body: Buffer.from(await imageFile.arrayBuffer()),
      ContentType: imageFile.type,
      ACL: 'public-read',
    })
    
    await s3Client.send(command)
    
    return `${process.env.WASABI_ENDPOINT}/${process.env.WASABI_BUCKET_NAME}/${fileName}`
  } catch (error) {
    console.error('Error uploading avatar:', error)
    throw new Error('Failed to upload avatar')
  }
}
