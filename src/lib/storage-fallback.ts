import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const FALLBACK_STORAGE_DIR = path.join(process.cwd(), 'public', 'uploads')

// Ensure the fallback directory exists
if (!fs.existsSync(FALLBACK_STORAGE_DIR)) {
  fs.mkdirSync(FALLBACK_STORAGE_DIR, { recursive: true })
}

export async function saveFallbackImage(
  imageUrl: string,
  folder: string = 'illustrations'
): Promise<string> {
  try {
    console.log('Using fallback local storage for image...')
    
    // Download the image
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; StoryNest/1.0)'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`)
    }
    
    const imageBuffer = await response.arrayBuffer()
    const fileName = `${folder}_${uuidv4()}.png`
    const filePath = path.join(FALLBACK_STORAGE_DIR, fileName)
    
    // Save to local storage
    fs.writeFileSync(filePath, Buffer.from(imageBuffer))
    
    // Return the public URL path
    const publicUrl = `/uploads/${fileName}`
    console.log(`Image saved locally: ${publicUrl}`)
    
    return publicUrl
  } catch (error) {
    console.error('Fallback storage failed:', error)
    throw error
  }
}

export function getFallbackStorageInfo() {
  return {
    directory: FALLBACK_STORAGE_DIR,
    publicPath: '/uploads/',
    enabled: true
  }
}
