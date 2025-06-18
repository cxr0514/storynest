import { Character, Story, ChildProfile, User } from '@/types'
import { mockUser, mockChildProfiles, mockCharacters, mockStories } from '@/lib/mock-data'

// Local Storage Keys
const STORAGE_KEYS = {
  USER: 'storynest_user',
  CHILD_PROFILES: 'storynest_child_profiles',
  CHARACTERS: 'storynest_characters',
  STORIES: 'storynest_stories',
  READING_PROGRESS: 'storynest_reading_progress'
} as const

// Type-safe local storage helpers
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error)
    return defaultValue
  }
}

function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error)
  }
}

// Initialize data if not exists
export function initializeStorageData(): void {
  const existingUser = getFromStorage(STORAGE_KEYS.USER, null)
  if (!existingUser) {
    setToStorage(STORAGE_KEYS.USER, mockUser)
    setToStorage(STORAGE_KEYS.CHILD_PROFILES, mockChildProfiles)
    setToStorage(STORAGE_KEYS.CHARACTERS, mockCharacters)
    setToStorage(STORAGE_KEYS.STORIES, mockStories)
  }
}

// User operations
export function getUser(): User | null {
  return getFromStorage(STORAGE_KEYS.USER, null)
}

export function updateUser(user: User): void {
  setToStorage(STORAGE_KEYS.USER, user)
}

// Child Profile operations
export function getChildProfiles(): ChildProfile[] {
  return getFromStorage(STORAGE_KEYS.CHILD_PROFILES, [])
}

export function addChildProfile(profile: ChildProfile): void {
  const profiles = getChildProfiles()
  profiles.push(profile)
  setToStorage(STORAGE_KEYS.CHILD_PROFILES, profiles)
}

export function updateChildProfile(updatedProfile: ChildProfile): void {
  const profiles = getChildProfiles()
  const index = profiles.findIndex(p => p.id === updatedProfile.id)
  if (index !== -1) {
    profiles[index] = updatedProfile
    setToStorage(STORAGE_KEYS.CHILD_PROFILES, profiles)
  }
}

export function getChildProfile(id: string): ChildProfile | undefined {
  return getChildProfiles().find(p => p.id === id)
}

// Character operations
export function getCharacters(): Character[] {
  return getFromStorage(STORAGE_KEYS.CHARACTERS, [])
}

export function getCharactersByChild(childProfileId: string): Character[] {
  return getCharacters().filter(c => c.childProfileId === childProfileId)
}

export function addCharacter(character: Character): void {
  const characters = getCharacters()
  characters.push(character)
  setToStorage(STORAGE_KEYS.CHARACTERS, characters)
}

export function updateCharacter(updatedCharacter: Character): void {
  const characters = getCharacters()
  const index = characters.findIndex(c => c.id === updatedCharacter.id)
  if (index !== -1) {
    characters[index] = updatedCharacter
    setToStorage(STORAGE_KEYS.CHARACTERS, characters)
  }
}

export function getCharacter(id: string): Character | undefined {
  return getCharacters().find(c => c.id === id)
}

// Story operations
export function getStories(): Story[] {
  return getFromStorage(STORAGE_KEYS.STORIES, [])
}

export function getStoriesByChild(childProfileId: string): Story[] {
  return getStories().filter(s => s.childProfileId === childProfileId)
}

export function addStory(story: Story): void {
  const stories = getStories()
  stories.push(story)
  setToStorage(STORAGE_KEYS.STORIES, stories)
}

export function updateStory(updatedStory: Story): void {
  const stories = getStories()
  const index = stories.findIndex(s => s.id === updatedStory.id)
  if (index !== -1) {
    stories[index] = updatedStory
    setToStorage(STORAGE_KEYS.STORIES, stories)
  }
}

export function getStory(id: string): Story | undefined {
  return getStories().find(s => s.id === id)
}

// Reading Progress operations
export function updateReadingProgress(storyId: string, childProfileId: string, currentPage: number): void {
  const story = getStory(storyId)
  if (story) {
    story.currentPage = currentPage
    story.updatedAt = new Date()
    if (currentPage >= story.pages.length) {
      story.isCompleted = true
    }
    updateStory(story)
  }
}

// Utility functions for generating IDs
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Character consistency utilities
export function getCharacterAppearances(characterId: string): Array<{storyId: string, description: string}> {
  const stories = getStories()
  const appearances: Array<{storyId: string, description: string}> = []
  
  stories.forEach(story => {
    if (story.characterIds.includes(characterId)) {
      story.pages.forEach(page => {
        if (page.characterDescriptions[characterId]) {
          appearances.push({
            storyId: story.id,
            description: page.characterDescriptions[characterId]
          })
        }
      })
    }
  })
  
  return appearances
}

export function calculateCharacterConsistency(characterId: string): number {
  // Mock consistency score calculation
  // In real implementation, this would use AI to compare descriptions
  const appearances = getCharacterAppearances(characterId)
  if (appearances.length <= 1) return 100
  
  // Simple mock: assume high consistency for our mock data
  return Math.floor(92 + Math.random() * 8) // 92-100%
}
