// Enhanced AI Prompt Utilities Integration for StorynestAI
// This file demonstrates how to integrate the tested AI prompt utilities
// with the existing story creation and illustration generation system

import { 
  generateIllustrationPrompt,
  cleanForClaude,
  buildCharacterMemory,
  type Character,
  type Scene
} from '@/lib/ai-prompt-utils'

// Enhanced illustration generation with character consistency
export async function generateStoryIllustrationWithConsistency(
  page: {
    number: number
    text: string
    characterDescriptions: Record<string, string>
  },
  characters: Array<{
    id: string
    name: string
    species: string
    physicalFeatures: string
    clothingAccessories?: string
    traits?: string[]
  }>,
  theme: string,
  storyContext?: string
) {
  try {
    // Convert StorynestAI character format to our utility format
    const primaryCharacter = characters[0] // Assuming first character is primary
    if (!primaryCharacter) {
      throw new Error('No characters provided for illustration')
    }

    const utilityCharacter: Character = {
      name: primaryCharacter.name,
      species: primaryCharacter.species,
      traits: [
        primaryCharacter.physicalFeatures,
        ...(primaryCharacter.clothingAccessories ? [primaryCharacter.clothingAccessories] : []),
        ...(primaryCharacter.traits || [])
      ].filter(Boolean)
    }

    // Extract scene information from page content
    const scene: Scene = {
      location: extractLocationFromText(page.text, theme),
      action: extractActionFromText(page.text, primaryCharacter.name)
    }

    // Generate the structured prompt using our utilities
    const structuredPrompt = generateIllustrationPrompt(utilityCharacter, scene)
    
    // For DALL-E 3, use the cleaned version
    const dallePrompt = cleanForClaude(structuredPrompt)
    
    // Add story context and enhance for consistency
    const enhancedPrompt = `${dallePrompt}

Story Context: ${storyContext || theme}
Page: ${page.number}
Consistency Note: Maintain the same character appearance as established in previous illustrations.

Style: Children's book illustration, magical and enchanting, high quality digital art.`

    console.log(`📝 Generated illustration prompt for ${primaryCharacter.name} on page ${page.number}`)
    console.log(`🎨 DALL-E Prompt: ${enhancedPrompt}`)

    return {
      structuredPrompt, // Full YAML version for storage
      dallePrompt: enhancedPrompt, // Enhanced version for DALL-E
      characterMemory: buildCharacterMemory(utilityCharacter, `Primary character in ${theme} story`)
    }

  } catch (error) {
    console.error('Error generating illustration prompt:', error)
    throw error
  }
}

// Helper function to extract location from page text
function extractLocationFromText(text: string, theme: string): string {
  // Basic keyword matching for location extraction
  const locationKeywords = {
    'Fantasy': ['forest', 'castle', 'mountain', 'village', 'cave', 'tower'],
    'Adventure': ['jungle', 'island', 'desert', 'ocean', 'valley', 'cliff'],
    'Modern': ['school', 'park', 'home', 'city', 'playground', 'library'],
    'Space': ['spaceship', 'planet', 'station', 'galaxy', 'moon', 'asteroid'],
    'Underwater': ['ocean', 'coral reef', 'deep sea', 'underwater cave', 'submarine']
  }

  const themeLocations = locationKeywords[theme as keyof typeof locationKeywords] || []
  
  for (const location of themeLocations) {
    if (text.toLowerCase().includes(location)) {
      return `${location} (${theme} theme)`
    }
  }

  // Fallback based on theme
  const fallbackLocations = {
    'Fantasy': 'Enchanted forest clearing',
    'Adventure': 'Mysterious jungle path',
    'Modern': 'Cozy neighborhood scene',
    'Space': 'Distant alien planet',
    'Underwater': 'Colorful coral reef'
  }

  return fallbackLocations[theme as keyof typeof fallbackLocations] || 'Magical storybook scene'
}

// Helper function to extract action from page text
function extractActionFromText(text: string, characterName: string): string {
  // Look for action verbs and activities
  const actionKeywords = [
    'running', 'jumping', 'flying', 'swimming', 'climbing', 'exploring',
    'discovering', 'finding', 'meeting', 'helping', 'playing', 'dancing',
    'singing', 'laughing', 'sleeping', 'dreaming', 'walking', 'riding'
  ]

  for (const action of actionKeywords) {
    if (text.toLowerCase().includes(action)) {
      return `${action} with joy and wonder`
    }
  }

  // Look for character name + verb patterns
  const sentences = text.split('. ')
  for (const sentence of sentences) {
    if (sentence.includes(characterName)) {
      // Extract the verb after the character name
      const words = sentence.split(' ')
      const nameIndex = words.findIndex(word => word.includes(characterName))
      if (nameIndex >= 0 && nameIndex < words.length - 1) {
        const nextWord = words[nameIndex + 1]
        if (nextWord && !['was', 'is', 'had', 'has'].includes(nextWord.toLowerCase())) {
          return `${nextWord} in the scene`
        }
      }
    }
  }

  return 'Standing peacefully in the scene'
}

// Character consistency manager for multi-page stories
export class StoryCharacterConsistencyManager {
  private characterMemories: Map<string, string> = new Map()

  addCharacterToStory(character: Character, storyContext: string) {
    const memory = buildCharacterMemory(character, storyContext)
    this.characterMemories.set(character.name, memory)
    return memory
  }

  getCharacterConsistencyPrompt(characterName: string): string {
    return this.characterMemories.get(characterName) || ''
  }

  getAllCharacterMemories(): Record<string, string> {
    return Object.fromEntries(this.characterMemories)
  }

  // Generate a consistency report for the story
  generateConsistencyReport(pages: Array<{ characterDescriptions: Record<string, string> }>): {
    score: number
    notes: string[]
  } {
    const notes: string[] = []
    let consistencyScore = 100

    // Analyze character consistency across pages
    const characterAppearances = new Map<string, string[]>()
    
    pages.forEach((page, index) => {
      Object.entries(page.characterDescriptions).forEach(([charId, description]) => {
        if (!characterAppearances.has(charId)) {
          characterAppearances.set(charId, [])
        }
        characterAppearances.get(charId)!.push(description)
      })
    })

    // Check for consistency issues
    characterAppearances.forEach((descriptions, charId) => {
      if (descriptions.length > 1) {
        const firstDescription = descriptions[0]
        const inconsistencies = descriptions.filter(desc => 
          !this.areDescriptionsConsistent(firstDescription, desc)
        )
        
        if (inconsistencies.length > 0) {
          consistencyScore -= (inconsistencies.length / descriptions.length) * 10
          notes.push(`Character ${charId} has ${inconsistencies.length} inconsistent descriptions`)
        }
      }
    })

    return {
      score: Math.max(0, Math.round(consistencyScore)),
      notes
    }
  }

  private areDescriptionsConsistent(desc1: string, desc2: string): boolean {
    // Simple consistency check - could be enhanced with AI
    const keywords1 = desc1.toLowerCase().split(' ')
    const keywords2 = desc2.toLowerCase().split(' ')
    
    // Check if core physical features are maintained
    const physicalFeatures = ['hair', 'eyes', 'scales', 'wings', 'tail', 'fur']
    
    for (const feature of physicalFeatures) {
      const has1 = keywords1.some(word => word.includes(feature))
      const has2 = keywords2.some(word => word.includes(feature))
      
      if (has1 !== has2) {
        return false // Inconsistency in physical features
      }
    }

    return true
  }
}

// Integration example for the existing story generation route
export async function enhanceExistingStoryGeneration(
  storyJSON: { title: string; pages: Array<{ number: number; text: string; illustrationPrompt?: string }> },
  characters: Array<{ id: string; name: string; species: string; physicalFeatures: string; clothingAccessories?: string }>,
  theme: string
) {
  const consistencyManager = new StoryCharacterConsistencyManager()
  const enhancedPages = []

  // Add characters to consistency manager
  characters.forEach(char => {
    const utilityChar: Character = {
      name: char.name,
      species: char.species,
      traits: [char.physicalFeatures, char.clothingAccessories].filter(Boolean)
    }
    consistencyManager.addCharacterToStory(utilityChar, `${theme} story: ${storyJSON.title}`)
  })

  // Enhance each page with consistent prompts
  for (const page of storyJSON.pages) {
    try {
      const promptData = await generateStoryIllustrationWithConsistency(
        {
          number: page.number,
          text: page.text,
          characterDescriptions: {} // This would come from the existing system
        },
        characters,
        theme,
        storyJSON.title
      )

      enhancedPages.push({
        ...page,
        enhancedIllustrationPrompt: promptData.dallePrompt,
        structuredPrompt: promptData.structuredPrompt,
        characterMemory: promptData.characterMemory
      })

    } catch (error) {
      console.error(`Failed to enhance page ${page.number}:`, error)
      enhancedPages.push(page) // Use original page if enhancement fails
    }
  }

  return {
    enhancedStory: {
      ...storyJSON,
      pages: enhancedPages
    },
    consistencyManager,
    characterMemories: consistencyManager.getAllCharacterMemories()
  }
}

export default {
  generateStoryIllustrationWithConsistency,
  StoryCharacterConsistencyManager,
  enhanceExistingStoryGeneration
}
