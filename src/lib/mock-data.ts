import { Character, Story, ChildProfile, User } from '@/types'

// Mock User Data
export const mockUser: User = {
  id: 'user-1',
  email: 'parent@example.com',
  name: 'Sarah Johnson',
  planTier: 'starter',
  storiesRemaining: 25,
  childProfiles: [],
  totalStoriesCreated: 5,
  totalCharactersCreated: 3,
  createdAt: new Date('2024-01-15'),
  lastLoginAt: new Date()
}

// Mock Child Profiles
export const mockChildProfiles: ChildProfile[] = [
  {
    id: 'child-1',
    name: 'Emma',
    age: 5,
    favoriteThemes: ['fantasy', 'magic', 'adventure'],
    favoriteCharacters: ['char-1', 'char-2'],
    readingLevel: 'beginner',
    storiesRead: 12,
    charactersCreated: 2,
    favoriteGenres: ['adventure', 'friendship'],
    createdAt: new Date('2024-01-16'),
    parentUserId: 'user-1'
  },
  {
    id: 'child-2',
    name: 'Lucas',
    age: 8,
    favoriteThemes: ['space', 'adventure', 'creative'],
    favoriteCharacters: ['char-3'],
    readingLevel: 'intermediate',
    storiesRead: 8,
    charactersCreated: 1,
    favoriteGenres: ['superhero', 'science'],
    createdAt: new Date('2024-02-01'),
    parentUserId: 'user-1'
  }
]

// Mock Characters
export const mockCharacters: Character[] = [
  {
    id: 'char-1',
    name: 'Fuzzy the Fox',
    species: 'animal',
    age: '5 years old',
    physicalFeatures: 'A small orange fox with bright blue eyes and a fluffy tail. Has soft orange fur with white markings on the chest and tip of tail.',
    clothingAccessories: 'Wears a cozy green scarf and tiny round glasses that sparkle in the light.',
    personalityTraits: ['clever', 'kind', 'curious', 'helpful'],
    personalityDescription: 'Fuzzy is incredibly smart and loves solving puzzles. Always ready to help friends in need and never gives up when facing challenges.',
    specialAbilities: 'Can understand all woodland creatures and has an amazing memory for solving riddles.',
    favoriteThings: 'Reading ancient books, collecting shiny pebbles, and helping lost travelers find their way.',
    speakingStyle: 'wise',
    favoritePhrases: ['Let me think about this...', 'Every problem has a solution!'],
    ageGroups: ['3-5', '6-8'],
    appearances: [],
    consistencyScore: 95,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    userId: 'user-1',
    childProfileId: 'child-1'
  },
  {
    id: 'char-2',
    name: 'Benny Bear',
    species: 'animal',
    age: '8 years old',
    physicalFeatures: 'A friendly brown bear with warm amber eyes and a gentle smile. Has thick, soft fur perfect for hugs.',
    clothingAccessories: 'Wears a red vest with golden buttons and a small backpack for adventures.',
    personalityTraits: ['brave', 'strong', 'gentle', 'protective'],
    personalityDescription: 'Benny is brave and strong but incredibly gentle. He protects his friends and always stands up for what is right.',
    specialAbilities: 'Super strong but knows how to be gentle. Can climb any tree and has an excellent sense of direction.',
    favoriteThings: 'Helping friends, exploring forests, sharing honey, and telling campfire stories.',
    speakingStyle: 'gentle',
    favoritePhrases: ["Don't worry, I'm here to help!", 'Together we can do anything!'],
    ageGroups: ['3-5', '6-8'],
    appearances: [],
    consistencyScore: 92,
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22'),
    userId: 'user-1',
    childProfileId: 'child-1'
  },
  {
    id: 'char-3',
    name: 'Captain Stellar',
    species: 'human',
    age: '10 years old',
    physicalFeatures: 'A young space explorer with curly brown hair and bright green eyes. Always has a confident smile.',
    clothingAccessories: 'Wears a silver space suit with a blue cape and a helmet with a golden star emblem.',
    personalityTraits: ['brave', 'adventurous', 'curious', 'leader'],
    personalityDescription: 'Captain Stellar is a natural leader who loves exploring new planets and meeting alien friends. Never afraid of the unknown.',
    specialAbilities: 'Expert pilot of starships and can communicate with alien species through universal friendship.',
    favoriteThings: 'Discovering new worlds, meeting alien friends, solving space mysteries, and protecting the galaxy.',
    speakingStyle: 'excited',
    favoritePhrases: ['To infinity and beyond!', 'Every star has a story!'],
    ageGroups: ['6-8', '9-12'],
    appearances: [],
    consistencyScore: 88,
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-05'),
    userId: 'user-1',
    childProfileId: 'child-2'
  }
]

// Mock Stories
export const mockStories: Story[] = [
  {
    id: 'story-1',
    title: 'The Brave Little Dragon',
    theme: 'fantasy',
    pages: [
      {
        id: 'page-1',
        pageNumber: 1,
        content: 'Once upon a time, in a magical forest, Fuzzy the Fox discovered a tiny dragon who was afraid to fly...',
        characterDescriptions: {
          'char-1': 'Fuzzy stood tall with his green scarf flowing in the breeze, his blue eyes twinkling with wisdom.',
        }
      },
      {
        id: 'page-2',
        pageNumber: 2,
        content: 'Fuzzy gently encouraged the little dragon, sharing stories of courage and friendship...',
        characterDescriptions: {
          'char-1': 'Fuzzy sat beside the dragon, his glasses catching the sunlight as he spoke with gentle wisdom.',
        }
      },
    ],
    summary: 'A heartwarming tale about courage and believing in yourself, featuring Fuzzy the Fox helping a young dragon overcome fear.',
    moralLesson: 'courage',
    characters: [mockCharacters[0]],
    characterIds: ['char-1'],
    currentPage: 1,
    isCompleted: false,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
    childProfileId: 'child-1',
    ageGroup: '3-5'
  },
  {
    id: 'story-2',
    title: 'Magical Forest Adventure',
    theme: 'magic',
    pages: [
      {
        id: 'page-1',
        pageNumber: 1,
        content: 'Fuzzy and Benny discovered a hidden path in the forest that sparkled with golden light...',
        characterDescriptions: {
          'char-1': 'Fuzzy adjusted his glasses and pointed excitedly at the glowing path ahead.',
          'char-2': 'Benny stood protectively beside Fuzzy, his red vest gleaming in the magical light.',
        }
      }
    ],
    summary: 'An enchanting adventure where best friends discover a magical realm and learn about the power of friendship.',
    moralLesson: 'friendship',
    characters: [mockCharacters[0], mockCharacters[1]],
    characterIds: ['char-1', 'char-2'],
    currentPage: 1,
    isCompleted: true,
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-02-25'),
    childProfileId: 'child-1',
    ageGroup: '3-5'
  }
]
