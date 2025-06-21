import OpenAI from 'openai'
import { STYLE_PREFIXES } from './styleMap'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

interface Character {
  id: string
  name: string
  species: string
  physicalFeatures: string
  styleName: string
}

export async function generateCharacterAvatar(character: Character): Promise<string | null> {
  try {
    console.log(`🎨 Generating avatar for character: ${character.name}`)
    
    const stylePrefix = STYLE_PREFIXES[character.styleName] || STYLE_PREFIXES.storybook_soft
    
    // Build the DALL-E prompt
    const prompt = `${stylePrefix}, ${character.name} full-body portrait, ${character.species}, ${character.physicalFeatures}, character design, single character on white background, high quality digital art`
    
    console.log(`🎨 DALL-E prompt: ${prompt}`)
    
    // Generate image with DALL-E 3
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      size: '1024x1024',
      quality: 'standard',
      n: 1
    })
    
    const imageUrl = response.data[0]?.url
    if (!imageUrl) {
      console.error('❌ No image URL returned from DALL-E')
      return null
    }
    
    console.log(`✅ DALL-E image generated: ${imageUrl}`)
    
    // Download the image
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      console.error('❌ Failed to download generated image')
      return null
    }
    
    const imageBuffer = await imageResponse.arrayBuffer()
    const buffer = Buffer.from(imageBuffer)
    
    // Upload to Wasabi S3
    const uploadedUrl = await uploadAvatarToWasabi(character.id, buffer)
    
    if (uploadedUrl) {
      console.log(`✅ Avatar uploaded to Wasabi: ${uploadedUrl}`)
    }
    
    return uploadedUrl
    
  } catch (error) {
    console.error('❌ Error generating character avatar:', error)
    return null
  }
}

async function uploadAvatarToWasabi(characterId: string, imageBuffer: Buffer): Promise<string | null> {
  try {
    // Import AWS SDK dynamically to avoid issues
    const AWS = await import('aws-sdk')
    
    // Configure Wasabi S3
    const s3 = new AWS.S3({
      endpoint: process.env.WASABI_ENDPOINT!,
      accessKeyId: process.env.WASABI_ACCESS_KEY_ID!,
      secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY!,
      region: process.env.WASABI_REGION || 'us-east-1',
      s3ForcePathStyle: true
    })
    
    const bucketName = process.env.WASABI_BUCKET_NAME!
    const key = `avatars/characters/${characterId}.png`
    
    const uploadParams = {
      Bucket: bucketName,
      Key: key,
      Body: imageBuffer,
      ContentType: 'image/png',
      ACL: 'public-read'
    }
    
    console.log(`📤 Uploading avatar to Wasabi: ${key}`)
    
    const result = await s3.upload(uploadParams).promise()
    
    return result.Location
    
  } catch (error) {
    console.error('❌ Error uploading avatar to Wasabi:', error)
    return null
  }
}
