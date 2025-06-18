const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test Parent',
      emailVerified: new Date(),
    },
  })

  console.log('👤 Created test user:', user.email)

  // Create test child profiles
  const child1 = await prisma.childProfile.upsert({
    where: { id: 'child-1' },
    update: {},
    create: {
      id: 'child-1',
      name: 'Emma',
      age: 5,
      interests: ['animals', 'magic', 'adventure'],
      userId: user.id,
    },
  })

  const child2 = await prisma.childProfile.upsert({
    where: { id: 'child-2' },
    update: {},
    create: {
      id: 'child-2',
      name: 'Oliver',
      age: 7,
      interests: ['space', 'robots', 'friendship'],
      userId: user.id,
    },
  })

  console.log('👧👦 Created child profiles:', child1.name, child2.name)

  // Create test characters
  const character1 = await prisma.character.upsert({
    where: { id: 'char-1' },
    update: {},
    create: {
      id: 'char-1',
      name: 'Luna the Unicorn',
      species: 'magical',
      age: 'Young adult',
      physicalFeatures: 'Beautiful white unicorn with a golden horn that sparkles in sunlight',
      clothingAccessories: 'Flowing silver mane with flower crown',
      personalityTraits: ['kind', 'brave', 'magical'],
      personalityDescription: 'A gentle unicorn with a golden horn who loves helping children learn about friendship and courage.',
      specialAbilities: 'Magic healing, light creation, teleportation',
      favoriteThings: 'Helping children, magical flowers, starlight',
      speakingStyle: 'gentle',
      favoritePhrases: ['Believe in yourself!', 'Magic comes from the heart'],
      ageGroups: ['3-5', '6-8'],
      appearances: [],
      userId: user.id,
      childProfileId: child1.id,
    },
  })

  const character2 = await prisma.character.upsert({
    where: { id: 'char-2' },
    update: {},
    create: {
      id: 'char-2',
      name: 'Benny the Bear',
      species: 'animal',
      age: 'Adult',
      physicalFeatures: 'Large, friendly brown bear with kind eyes and soft fur',
      clothingAccessories: 'Red checkered vest and small reading glasses',
      personalityTraits: ['friendly', 'wise', 'caring'],
      personalityDescription: 'A wise brown bear who loves teaching children about nature and problem-solving.',
      specialAbilities: 'Forest navigation, problem solving, nature wisdom',
      favoriteThings: 'Honey, books, helping friends, forest walks',
      speakingStyle: 'warm',
      favoritePhrases: ['Let\'s think about this together', 'Every problem has a solution'],
      ageGroups: ['4-6', '7-9'],
      appearances: [],
      userId: user.id,
      childProfileId: child1.id,
    },
  })

  const character3 = await prisma.character.upsert({
    where: { id: 'char-3' },
    update: {},
    create: {
      id: 'char-3',
      name: 'Robo the Robot',
      species: 'robot',
      age: 'Timeless',
      physicalFeatures: 'Shiny silver robot with blue LED eyes and articulated joints',
      clothingAccessories: 'Built-in tool belt and holographic display screen',
      personalityTraits: ['logical', 'curious', 'helpful'],
      personalityDescription: 'A friendly robot from the future who loves science and helping children learn.',
      specialAbilities: 'Computing, data analysis, holographic projections, flying',
      favoriteThings: 'Science experiments, learning new things, helping solve problems',
      speakingStyle: 'enthusiastic',
      favoritePhrases: ['Computing... solution found!', 'Fascinating discovery!'],
      ageGroups: ['5-7', '8-10'],
      appearances: [],
      userId: user.id,
      childProfileId: child2.id,
    },
  })

  console.log('🎭 Created characters:', character1.name, character2.name, character3.name)

  // Create a test story
  const story = await prisma.story.create({
    data: {
      id: 'story-1',
      title: 'Luna and the Magic Forest',
      theme: 'magic',
      summary: 'Luna the Unicorn helps Emma discover the magic within herself when they get lost in an enchanted forest.',
      moralLesson: 'courage',
      currentPage: 1,
      isCompleted: false,
      readingProgress: 0.25,
      userId: user.id,
      childProfileId: child1.id,
      pages: {
        create: [
          {
            pageNumber: 1,
            content: 'Once upon a time, in a magical forest filled with sparkling trees and singing flowers, lived Luna the Unicorn. Her golden horn shimmered in the sunlight as she grazed peacefully in a meadow.',
            characterDescriptions: JSON.stringify({
              [character1.id]: 'Luna appears as a beautiful white unicorn with a golden horn that sparkles in the sunlight, standing gracefully in a flower-filled meadow.'
            }),
          },
          {
            pageNumber: 2,
            content: 'One day, a little girl named Emma wandered into the forest, feeling scared and alone. She had gotten separated from her family during their picnic.',
            characterDescriptions: JSON.stringify({}),
          },
          {
            pageNumber: 3,
            content: 'Luna noticed Emma crying by a large oak tree. "Don\'t worry, little one," Luna said gently. "I\'ll help you find your way home."',
            characterDescriptions: JSON.stringify({
              [character1.id]: 'Luna approaches Emma with kind, understanding eyes, her horn glowing softly to provide comfort.'
            }),
          },
          {
            pageNumber: 4,
            content: 'As they walked through the forest together, they encountered Benny the Bear, who knew all the forest paths. "I can help too!" Benny said warmly.',
            characterDescriptions: JSON.stringify({
              [character1.id]: 'Luna stands beside Emma, her horn providing a gentle light.',
              [character2.id]: 'Benny appears as a kind brown bear with wise eyes, standing on his hind legs and gesturing helpfully with his paws.'
            }),
          }
        ]
      },
      characters: {
        create: [
          {
            characterId: character1.id
          },
          {
            characterId: character2.id
          }
        ]
      }
    },
    include: {
      pages: true,
      characters: true
    }
  })

  console.log('📚 Created story:', story.title)

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })