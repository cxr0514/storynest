/** Story creation enums - matching Prisma schema */
export type StoryLanguage =
  | 'English' | 'Spanish' | 'French' | 'German' | 'Italian'
  | 'Portuguese' | 'Dutch' | 'Swedish' | 'Japanese' | 'Chinese'

// UI labels for story categories
export type StoryCategoryLabel =
  | 'Bedtime Story: A classic.'
  | 'Fable: Moral lessons, talking animals.'
  | 'Fairytale: Magic, enchanting creatures, happy endings.'
  | 'Adventure: Exciting journeys, young heroes, challenges.'
  | 'Educational: Informative, age-appropriate facts, engaging.'
  | 'Mystery: Puzzles, clues, child detectives.'
  | 'Science fiction: Futuristic, imaginative worlds, exploration.'
  | 'Realistic fiction: Everyday life, relatable characters, emotions.'

// Prisma enum values for story categories
export type StoryCategory = 
  | 'BedtimeStory' | 'Fable' | 'Fairytale' | 'Adventure'
  | 'Educational' | 'Mystery' | 'ScienceFiction' | 'RealisticFiction'

// UI labels for writing styles
export type StoryWritingStyleLabel =
  | 'Imaginative: Creative, whimsical, fantastical elements.'
  | 'Funny: Humorous, witty, light-hearted tone.'
  | 'Heartwarming: Uplifting, positive messages, emotional connections.'
  | 'Action-packed: Fast-paced, thrilling, adventure-filled.'
  | 'Nostalgic: Familiar settings, relatable experiences, memories.'
  | 'Empowering: Confidence-building, inspiring, strong characters.'
  | 'Spooky: Mild scares, eerie settings, suspenseful.'
  | 'Educational: Informative, engaging, age-appropriate lessons.'

// Prisma enum values for writing styles
export type StoryWritingStyle =
  | 'Imaginative' | 'Funny' | 'Heartwarming' | 'ActionPacked'
  | 'Nostalgic' | 'Empowering' | 'Spooky' | 'Educational'

// Mapping functions for UI labels to enum values
export const STORY_CATEGORY_MAP: Record<StoryCategoryLabel, StoryCategory> = {
  'Bedtime Story: A classic.': 'BedtimeStory',
  'Fable: Moral lessons, talking animals.': 'Fable',
  'Fairytale: Magic, enchanting creatures, happy endings.': 'Fairytale',
  'Adventure: Exciting journeys, young heroes, challenges.': 'Adventure',
  'Educational: Informative, age-appropriate facts, engaging.': 'Educational',
  'Mystery: Puzzles, clues, child detectives.': 'Mystery',
  'Science fiction: Futuristic, imaginative worlds, exploration.': 'ScienceFiction',
  'Realistic fiction: Everyday life, relatable characters, emotions.': 'RealisticFiction',
}

export const STORY_WRITING_STYLE_MAP: Record<StoryWritingStyleLabel, StoryWritingStyle> = {
  'Imaginative: Creative, whimsical, fantastical elements.': 'Imaginative',
  'Funny: Humorous, witty, light-hearted tone.': 'Funny',
  'Heartwarming: Uplifting, positive messages, emotional connections.': 'Heartwarming',
  'Action-packed: Fast-paced, thrilling, adventure-filled.': 'ActionPacked',
  'Nostalgic: Familiar settings, relatable experiences, memories.': 'Nostalgic',
  'Empowering: Confidence-building, inspiring, strong characters.': 'Empowering',
  'Spooky: Mild scares, eerie settings, suspenseful.': 'Spooky',
  'Educational: Informative, engaging, age-appropriate lessons.': 'Educational',
}

// Reverse mapping functions for enum values to UI labels
export const STORY_CATEGORY_REVERSE_MAP: Record<StoryCategory, StoryCategoryLabel> = {
  'BedtimeStory': 'Bedtime Story: A classic.',
  'Fable': 'Fable: Moral lessons, talking animals.',
  'Fairytale': 'Fairytale: Magic, enchanting creatures, happy endings.',
  'Adventure': 'Adventure: Exciting journeys, young heroes, challenges.',
  'Educational': 'Educational: Informative, age-appropriate facts, engaging.',
  'Mystery': 'Mystery: Puzzles, clues, child detectives.',
  'ScienceFiction': 'Science fiction: Futuristic, imaginative worlds, exploration.',
  'RealisticFiction': 'Realistic fiction: Everyday life, relatable characters, emotions.',
}

export const STORY_WRITING_STYLE_REVERSE_MAP: Record<StoryWritingStyle, StoryWritingStyleLabel> = {
  'Imaginative': 'Imaginative: Creative, whimsical, fantastical elements.',
  'Funny': 'Funny: Humorous, witty, light-hearted tone.',
  'Heartwarming': 'Heartwarming: Uplifting, positive messages, emotional connections.',
  'ActionPacked': 'Action-packed: Fast-paced, thrilling, adventure-filled.',
  'Nostalgic': 'Nostalgic: Familiar settings, relatable experiences, memories.',
  'Empowering': 'Empowering: Confidence-building, inspiring, strong characters.',
  'Spooky': 'Spooky: Mild scares, eerie settings, suspenseful.',
  'Educational': 'Educational: Informative, engaging, age-appropriate lessons.',
}

// Core model interfaces
export interface User {
  id: string
  name?: string
  email: string
  emailVerified?: Date
  image?: string
  credits: number
  plan: string
  planExpiresAt?: Date
  stripeCustomerId?: string
  storiesGenerated: number
  createdAt: Date
  updatedAt: Date
}

export interface ChildProfile {
  id: string
  name: string
  age: number
  interests: string[]
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface Character {
  id: string
  name: string
  species: string
  age: string
  physicalFeatures: string
  clothingAccessories: string
  personalityTraits: string[]
  personalityDescription: string
  specialAbilities: string
  favoriteThings: string
  speakingStyle: string
  favoritePhrases: string[]
  userId: string
  childProfileId: string
  createdAt: Date
  updatedAt: Date
  imageUrl?: string
}

export interface Story {
  id: string
  title: string
  theme: string
  summary: string
  moralLesson?: string
  currentPage: number
  isCompleted: boolean
  progressPercent: number
  content?: string
  language: StoryLanguage
  category: StoryCategory
  writingStyle: StoryWritingStyle
  readerAge: string
  userId: string
  childProfileId: string
  createdAt: Date
  updatedAt: Date
}

export interface StoryTheme {
  id: string
  name: string
  description: string
}
