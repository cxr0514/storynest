import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateStoryWithOpenAI } from '@/lib/openai'
import { calculateCharacterConsistency, calculateEnhancedCharacterConsistency } from '@/lib/analytics'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      theme,
      characterIds,
      childProfileId,
      customPrompt,
      moralLesson,
      enhancedMode = false,
      realTimeAnalytics = false
    } = await req.json()

    if (!theme || !characterIds || !childProfileId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify child profile belongs to user
    const childProfile = await prisma.childProfile.findFirst({
      where: {
        id: childProfileId,
        userId: session.user.id
      }
    })

    if (!childProfile) {
      return NextResponse.json({ error: 'Child profile not found' }, { status: 404 })
    }

    // Get characters with their stories for consistency analysis
    const characters = await Promise.all(
      characterIds.map(async (id: string) => {
        const character = await prisma.character.findUnique({
          where: { id },
          include: {
            stories: {
              include: {
                story: {
                  select: {
                    id: true,
                    theme: true,
                    createdAt: true
                  }
                }
              }
            }
          }
        })

        if (!character || character.childProfileId !== childProfileId) {
          return null
        }

        return character
      })
    )

    const validCharacters = characters.filter(Boolean)
    
    if (validCharacters.length === 0) {
      return NextResponse.json({ error: 'No valid characters found' }, { status: 400 })
    }

    // Generate story with OpenAI
    const storyData = await generateStoryWithOpenAI({
      theme,
      characterIds,
      childProfileId,
      customPrompt,
      moralLesson,
      targetLength: 'medium' // Default target length
    }, validCharacters)

    // Enhanced mode with analytics
    let analyticsData = null
    if (enhancedMode && realTimeAnalytics) {
      // Calculate character consistency for the generated story
      const characterAnalytics = await Promise.all(
        validCharacters.map(async (character) => {
          const characterData = {
            id: character.id,
            name: character.name,
            description: character.description || '',
            appearance: {
              physicalFeatures: character.physicalFeatures || [],
              clothing: character.clothing || [],
              accessories: character.accessories || []
            },
            personality: {
              traits: character.personality || [],
              quirks: character.quirks || [],
              favoriteThings: character.favoriteThings || [],
              speechPatterns: character.speechPattern || [],
              backstory: character.backstory || ''
            },
            stories: [
              ...character.stories.map((s: { story: unknown }) => s.story),
              {
                id: 'temp-generated',
                content: storyData.pages.map(p => p.content).join(' '),
                theme,
                createdAt: new Date(),
                childProfileId: character.childProfileId
              }
            ]
          }

          const basicConsistency = await calculateCharacterConsistency(characterData)
          const enhancedConsistency = await calculateEnhancedCharacterConsistency(characterData)

          return {
            characterId: character.id,
            characterName: character.name,
            basicConsistency,
            enhancedConsistency
          }
        })
      )

      analyticsData = {
        characterAnalytics,
        overallConsistency: characterAnalytics.reduce((sum, char) => sum + char.basicConsistency.consistencyScore, 0) / characterAnalytics.length,
        suggestions: generateStoryImprovements(characterAnalytics),
        timestamp: new Date().toISOString()
      }
    }

    // Create story in database if not in preview mode
    let savedStory: { id: string } | null = null
    if (!customPrompt || customPrompt.includes('SAVE_STORY')) {
      savedStory = await prisma.story.create({
        data: {
          title: storyData.title,
          theme,
          summary: storyData.summary,
          moralLesson: moralLesson || null,
          childProfileId,
          userId: session.user.id,
        }
      })

      // Link characters to story
      if (savedStory) {
        await Promise.all(
          characterIds.map((characterId: string) =>
            prisma.storyCharacter.create({
              data: {
                storyId: savedStory!.id,
                characterId
              }
            }).catch(() => {
              // Ignore if relation already exists or model doesn't exist
              console.log('Story-Character relation not created')
            })
          )
        )
      }
    }

    return NextResponse.json({
      success: true,
      story: {
        id: savedStory?.id || 'preview',
        title: storyData.title,
        content: storyData.pages.map(p => p.content).join('\n\n'),
        pages: storyData.pages,
        summary: storyData.summary,
        theme,
        characterIds,
        analytics: analyticsData
      }
    })

  } catch (error) {
    console.error('Error generating story with analytics:', error)
    return NextResponse.json({ 
      error: 'Failed to generate story',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

interface CharacterAnalysis {
  characterName: string;
  basicConsistency: { consistencyScore: number };
  enhancedConsistency: { consistencyScore: number };
}

interface StoryImprovement {
  type: string;
  character: string;
  suggestion: string;
  priority: string;
  message: string;
}

function generateStoryImprovements(characterAnalytics: CharacterAnalysis[]): StoryImprovement[] {
  const suggestions: StoryImprovement[] = []

  for (const charAnalysis of characterAnalytics) {
    const { characterName, basicConsistency, enhancedConsistency } = charAnalysis

    // Check basic consistency
    if (basicConsistency.consistencyScore < 70) {
      suggestions.push({
        type: 'consistency',
        priority: 'high',
        character: characterName,
        message: `Improve ${characterName}'s consistency`,
        suggestion: 'Ensure character traits and behavior remain consistent throughout the story.'
      })
    }

    // Check enhanced consistency
    if (enhancedConsistency.consistencyScore < 60) {
      suggestions.push({
        type: 'enhancement',
        priority: 'medium',
        character: characterName,
        message: `Enhance ${characterName}'s characterization`,
        suggestion: 'Add more depth to character interactions and personality expressions.'
      })
    }

    // Positive feedback for good consistency
    if (basicConsistency.consistencyScore >= 80) {
      suggestions.push({
        type: 'positive',
        priority: 'low',
        character: characterName,
        message: `Excellent consistency for ${characterName}!`,
        suggestion: 'Character portrayal is well-maintained throughout the story.'
      })
    }
  }

  return suggestions
}
