import { uploadImageToS3 } from './storage-cloud'

/**
 * Copy an image from a URL to Wasabi S3 storage
 * 
 * @param imageUrl - The URL of the image to copy
 * @param folder - The folder to store the image in (e.g., 'avatars', 'illustrations')
 * @returns Promise<string> - The public URL of the uploaded image
 */
export async function copyImageToWasabi(imageUrl: string, folder: string): Promise<string> {
  try {
    console.log(`Copying image to Wasabi: ${imageUrl} -> ${folder}/`)
    const uploadedUrl = await uploadImageToS3(imageUrl, folder)
    console.log(`Successfully copied to Wasabi: ${uploadedUrl}`)
    return uploadedUrl
  } catch (error) {
    console.error('Failed to copy image to Wasabi:', error)
    throw error
  }
}
