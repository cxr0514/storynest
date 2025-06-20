// Character Types
export interface Character {
  id: string
  name: string
  species: string
  age: string
  
  // Appearance
  physicalFeatures: string
  clothingAccessories: string
  
  // Personality
  personalityTraits: string[]
  personalityDescription: string
  
  // Background
  specialAbilities: string
  favoriteThings: string
  
  // Voice & Speech
  speakingStyle: string
  favoritePhrases: string[]
  
  // Consistency tracking
  ageGroups: string[]
  appearances: CharacterAppearance[]
  consistencyScore: number
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  childProfileId: string
  userId: string
}

export interface CharacterAppearance {
  storyId: string
  imageUrl?: string
  description: string
  consistency_score?: number
  createdAt: Date
}

// Story Types
export interface Story {
  id: string
  title: string
  theme: StoryTheme
  
  // Content
  StoryPage: StoryPage[]
  summary: string
  moralLesson?: string
  
  // Characters
  StoryCharacter: { Character: Character }[]
  characterIds: string[]
  
  // Progress
  currentPage: number
  isCompleted: boolean
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  childProfileId: string
  ageGroup: string
}

export interface StoryPage {
  id: string
  pageNumber: number
  content: string
  imageUrl?: string
  imagePrompt?: string
  characterDescriptions: Record<string, string> // characterId -> description for this page
}

export type StoryTheme = 
  | 'fantasy' 
  | 'space' 
  | 'ocean' 
  | 'magic' 
  | 'adventure' 
  | 'circus' 
  | 'dreams' 
  | 'creative'

// Child Profile Types
export interface ChildProfile {
  id: string
  name: string
  age: number
  
  // Preferences - matches database schema
  interests: string[] // Database field name
  
  // Optional fields that might be added later
  favoriteThemes?: StoryTheme[]
  favoriteCharacters?: string[] // character IDs
  readingLevel?: 'beginner' | 'intermediate' | 'advanced'
  
  // Progress tracking - optional for now
  storiesRead?: number
  charactersCreated?: number
  favoriteGenres?: string[]
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  userId: string // matches database
}

// User Types
export interface User {
  id: string
  email: string
  name: string
  
  // Subscription
  planTier: 'free' | 'starter' | 'premium' | 'lifetime'
  storiesRemaining: number
  subscriptionEndsAt?: Date
  
  // Profiles
  childProfiles: ChildProfile[]
  
  // Usage tracking
  totalStoriesCreated: number
  totalCharactersCreated: number
  
  // Metadata
  createdAt: Date
  lastLoginAt: Date
}

// Story Generation Types
export interface StoryGenerationRequest {
  childProfileId: string
  theme: StoryTheme
  characterIds: string[]
  customPrompt?: string
  moralLesson?: string
  targetLength: 'short' | 'medium' | 'long'
  pageCount?: number
}

export interface StoryGenerationResponse {
  story: Omit<Story, 'id' | 'createdAt' | 'updatedAt'>
  estimatedReadingTime: number
  characterConsistencyScore: number
}

// Character Consistency Types
export interface CharacterConsistencyPrompt {
  characterId: string
  baseDescription: string
  previousAppearances: CharacterAppearance[]
  storyContext: string
}

export interface CharacterConsistencyValidation {
  characterId: string
  score: number // 0-100
  issues: string[]
  suggestions: string[]
}

// NextAuth session types
export interface ExtendedUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

declare module "next-auth" {
  interface Session {
    user: ExtendedUser
  }
}
