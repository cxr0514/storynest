import { StoryGenerationRequest, StoryGenerationResponse, Story, StoryPage, Character } from '@/types'
import { getCharacter, generateId } from '@/lib/storage'

// Mock story templates by theme
const storyTemplates = {
  fantasy: {
    settings: ['enchanted forest', 'magical castle', 'mystical kingdom', 'fairy tale village'],
    plotElements: ['discovers a hidden treasure', 'helps a lost creature', 'solves an ancient riddle', 'breaks a magical spell'],
    challenges: ['overcomes fear', 'learns to work together', 'finds inner courage', 'helps a friend in need']
  },
  magic: {
    settings: ['magical garden', 'wizard\'s tower', 'enchanted library', 'crystal cave'],
    plotElements: ['learns a new spell', 'finds a magical artifact', 'meets a wise mentor', 'discovers hidden powers'],
    challenges: ['controls new abilities', 'uses magic responsibly', 'helps others with gifts', 'learns patience']
  },
  space: {
    settings: ['distant planet', 'space station', 'alien world', 'cosmic adventure'],
    plotElements: ['explores new worlds', 'meets alien friends', 'solves space mysteries', 'saves the galaxy'],
    challenges: ['works with different species', 'learns about diversity', 'shows courage in unknown', 'protects others']
  },
  ocean: {
    settings: ['underwater kingdom', 'coral reef', 'mysterious island', 'deep sea adventure'],
    plotElements: ['discovers sea treasures', 'befriends sea creatures', 'explores ocean depths', 'protects marine life'],
    challenges: ['overcomes water fears', 'learns about nature', 'helps sea animals', 'shows environmental care']
  },
  adventure: {
    settings: ['mountain peak', 'jungle expedition', 'desert oasis', 'ancient ruins'],
    plotElements: ['embarks on quest', 'finds hidden paths', 'discovers ancient secrets', 'overcomes obstacles'],
    challenges: ['shows perseverance', 'learns teamwork', 'faces challenges bravely', 'helps fellow adventurers']
  }
}

// Moral lesson templates
const moralLessons = {
  friendship: 'the importance of being a good friend and helping others',
  courage: 'finding bravery even when feeling scared',
  honesty: 'always telling the truth, even when it\'s difficult',
  sharing: 'the joy of sharing with others and being generous',
  perseverance: 'never giving up, even when things get tough',
  respect: 'treating everyone with kindness and respect'
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function generateCharacterDescription(characterId: string): string {
  const character = getCharacter(characterId)
  if (!character) return 'A mysterious character appears'
  
  // Generate description that maintains consistency
  const baseDescription = character.physicalFeatures
  const clothingDescription = character.clothingAccessories
  const contextualBehavior = getRandomElement([
    'looking excited about the adventure',
    'ready to help friends',
    'showing curiosity about the surroundings',
    'displaying their characteristic kindness'
  ])
  
  return `${character.name} appears ${baseDescription.toLowerCase()}. ${clothingDescription} They are ${contextualBehavior}.`
}

function generateStoryContent(
  request: StoryGenerationRequest,
  characters: (Character | undefined)[],
  setting: string,
  plotElement: string,
  challenge: string
): StoryPage[] {
  // Filter out undefined characters
  const validCharacters = characters.filter((c): c is Character => c !== undefined)
  const characterNames = validCharacters.map(c => c.name).join(' and ')
  const mainCharacter = validCharacters[0]
  
  if (!mainCharacter) {
    throw new Error('No valid characters provided for story generation')
  }
  
  const pages: StoryPage[] = [
    {
      id: generateId('page'),
      pageNumber: 1,
      content: `Once upon a time, in a ${setting}, ${characterNames} discovered something magical. ${mainCharacter.name} noticed ${plotElement} and felt a sense of wonder fill their heart.`,
      characterDescriptions: {}
    },
    {
      id: generateId('page'),
      pageNumber: 2,
      content: `As they explored further, ${characterNames} encountered a challenge that would test their friendship. They needed to work together to ${challenge} and help others along the way.`,
      characterDescriptions: {}
    },
    {
      id: generateId('page'),
      pageNumber: 3,
      content: `Through their adventure, ${mainCharacter.name} learned ${request.moralLesson ? moralLessons[request.moralLesson as keyof typeof moralLessons] : 'valuable lessons about friendship'}. With their friends by their side, they felt ready for any challenge.`,
      characterDescriptions: {}
    },
    {
      id: generateId('page'),
      pageNumber: 4,
      content: `In the end, ${characterNames} returned home with hearts full of joy and memories to last forever. They knew that no matter what adventures awaited them, they would always have each other.`,
      characterDescriptions: {}
    }
  ]
  
  // Add character descriptions to each page
  pages.forEach(page => {
    validCharacters.forEach(character => {
      page.characterDescriptions[character.id] = generateCharacterDescription(character.id)
    })
  })
  
  return pages
}

export async function generateStory(request: StoryGenerationRequest): Promise<StoryGenerationResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Get characters
  const characters = request.characterIds.map(id => getCharacter(id)).filter(Boolean)
  
  if (characters.length === 0) {
    throw new Error('No valid characters found for story generation')
  }
  
  // Get story template elements
  const template = storyTemplates[request.theme as keyof typeof storyTemplates] || storyTemplates.fantasy
  const setting = getRandomElement(template.settings)
  const plotElement = getRandomElement(template.plotElements)
  const challenge = getRandomElement(template.challenges)
  
  // Generate title
  const titlePrefixes = ['The Adventure of', 'The Tale of', 'The Journey of', 'The Story of']
  const characterNames = characters.map(c => c?.name || 'Unknown').join(' and ')
  const title = `${getRandomElement(titlePrefixes)} ${characterNames}`
  
  // Generate story pages
  const pages = generateStoryContent(request, characters, setting, plotElement, challenge)
  
  // Generate summary
  const summary = `A heartwarming ${request.theme} adventure where ${characterNames} ${plotElement} and learns ${request.moralLesson ? moralLessons[request.moralLesson as keyof typeof moralLessons] : 'about friendship and courage'}.`
  
  // Filter out any undefined characters
  const validCharacters = characters.filter((c): c is Character => c !== undefined)
  
  const story: Omit<Story, 'id' | 'createdAt' | 'updatedAt'> = {
    title,
    theme: request.theme,
    pages,
    summary,
    moralLesson: request.moralLesson,
    characters: validCharacters,
    characterIds: request.characterIds,
    currentPage: 1,
    isCompleted: false,
    childProfileId: request.childProfileId,
    ageGroup: '3-8' // Default for now
  }
  
  return {
    story,
    estimatedReadingTime: pages.length * 2, // 2 minutes per page
    characterConsistencyScore: 95 // Mock high consistency score
  }
}

export function validateStoryRequest(request: StoryGenerationRequest): string[] {
  const errors: string[] = []
  
  if (!request.childProfileId) {
    errors.push('Child profile is required')
  }
  
  if (!request.theme) {
    errors.push('Story theme is required')
  }
  
  if (!request.characterIds || request.characterIds.length === 0) {
    errors.push('At least one character is required')
  }
  
  if (request.characterIds && request.characterIds.length > 3) {
    errors.push('Maximum 3 characters allowed per story')
  }
  
  return errors
}
