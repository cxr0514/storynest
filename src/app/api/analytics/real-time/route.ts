import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { calculateCharacterConsistency, calculateEnhancedCharacterConsistency } from '@/lib/analytics'
import { prisma } from '@/lib/prisma'

// Type definitions for character data structure
interface CharacterData {
  id: string;
  name: string;
  description: string;
  appearance: {
    physicalFeatures: string[];
    clothing: string[];
    accessories: string[];
  };
  personality: {
    traits: string[];
    quirks: string[];
    favoriteThings: string[];
    speechPatterns: string[];
    backstory: string;
  };
  stories: StoryData[];
}

interface StoryData {
  id: string;
  content: string;
  theme: string;
  createdAt: Date;
  childProfileId: string;
}

interface RealTimeFeedback {
  visualConsistency: number;
  personalityConsistency: number;
  speechConsistency: number;
  behaviorConsistency: number;
  overallScore: number;
  warnings: string[];
  suggestions: string[];
}

interface Suggestion {
  type: string;
  priority: string;
  message: string;
  details: string;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      characterId, 
      storyContent, 
      storyContext
    } = await req.json()

    if (!characterId || !storyContent) {
      return NextResponse.json({ error: 'Character ID and story content required' }, { status: 400 })
    }

    // Get character data with existing stories
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      include: {
        stories: {
          include: {
            story: {
              select: {
                id: true,
                title: true,
                theme: true,
                createdAt: true,
                pages: {
                  select: {
                    content: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }

    // Verify user owns this character
    const childProfile = await prisma.childProfile.findUnique({
      where: { 
        id: character.childProfileId,
        userId: session.user.id
      }
    })

    if (!childProfile) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Create temporary story data for real-time analysis
    const tempStoryData = {
      id: 'temp-' + Date.now(),
      content: storyContent,
      theme: storyContext?.theme || 'adventure',
      createdAt: new Date(),
      childProfileId: character.childProfileId
    }

    // Calculate real-time consistency metrics
    const characterData = {
      id: character.id,
      name: character.name,
      description: character.personalityDescription || '',
      appearance: {
        physicalFeatures: [character.physicalFeatures],
        clothing: [character.clothingAccessories],
        accessories: []
      },
      personality: {
        traits: character.personalityTraits || [],
        quirks: [],
        favoriteThings: [character.favoriteThings],
        speechPatterns: character.favoritePhrases || [],
        backstory: character.personalityDescription || ''
      },
      stories: [...character.stories.map(s => ({
        id: s.story.id,
        content: s.story.pages.map(p => p.content).join(' '),
        theme: s.story.theme,
        createdAt: s.story.createdAt,
        childProfileId: character.childProfileId
      })), tempStoryData]
    }

    // Basic consistency analysis
    const basicConsistency = await calculateCharacterConsistency(characterData)
    
    // Enhanced AI-powered analysis
    const enhancedConsistency = await calculateEnhancedCharacterConsistency(characterData)

    // Real-time feedback analysis
    const realTimeFeedback = analyzeRealTimeFeedback(characterData, storyContent)

    // Generate improvement suggestions
    const suggestions = generateRealTimeSuggestions(basicConsistency, enhancedConsistency, realTimeFeedback)

    return NextResponse.json({
      success: true,
      analytics: {
        basicConsistency,
        enhancedConsistency,
        realTimeFeedback,
        suggestions
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in real-time analytics:', error)
    return NextResponse.json({ error: 'Failed to analyze content' }, { status: 500 })
  }
}

function analyzeRealTimeFeedback(characterData: CharacterData, currentContent: string): RealTimeFeedback {
  const feedback = {
    visualConsistency: 0,
    personalityConsistency: 0,
    speechConsistency: 0,
    behaviorConsistency: 0,
    overallScore: 0,
    warnings: [] as string[],
    suggestions: [] as string[]
  }

  // Analyze visual consistency
  const physicalFeatures = characterData.appearance?.physicalFeatures || []
  const mentionedFeatures = physicalFeatures.filter((feature: string) => 
    currentContent.toLowerCase().includes(feature.toLowerCase())
  )
  
  if (physicalFeatures.length > 0) {
    feedback.visualConsistency = (mentionedFeatures.length / physicalFeatures.length) * 100
    
    if (feedback.visualConsistency < 30) {
      feedback.warnings.push('Few visual features mentioned in current story')
      feedback.suggestions.push('Consider describing the character\'s appearance')
    }
  }

  // Analyze personality consistency
  const personalityTraits = characterData.personality?.traits || []
  const mentionedTraits = personalityTraits.filter((trait: string) => 
    currentContent.toLowerCase().includes(trait.toLowerCase()) ||
    currentContent.toLowerCase().includes(getTraitSynonyms(trait))
  )
  
  if (personalityTraits.length > 0) {
    feedback.personalityConsistency = (mentionedTraits.length / personalityTraits.length) * 100
    
    if (feedback.personalityConsistency < 40) {
      feedback.warnings.push('Character personality not well reflected')
      feedback.suggestions.push('Show the character\'s personality through actions and dialogue')
    }
  }

  // Analyze speech patterns
  const speechPatterns = characterData.personality?.speechPatterns || []
  const hasSpeechPatterns = speechPatterns.some((pattern: string) => 
    currentContent.includes(pattern)
  )
  
  feedback.speechConsistency = hasSpeechPatterns ? 80 : 20
  
  if (!hasSpeechPatterns && speechPatterns.length > 0) {
    feedback.warnings.push('Character speech patterns not reflected')
    feedback.suggestions.push(`Use the character's speech patterns: ${speechPatterns.join(', ')}`)
  }

  // Calculate overall score
  feedback.overallScore = Math.round(
    (feedback.visualConsistency + feedback.personalityConsistency + feedback.speechConsistency) / 3
  )

  return feedback
}

function generateRealTimeSuggestions(
  basicConsistency: { consistencyScore: number }, 
  enhancedConsistency: { consistencyScore: number; behaviorScore?: number }, 
  realTimeFeedback: RealTimeFeedback
): Suggestion[] {
  const suggestions: Suggestion[] = []

  // Based on basic consistency
  if (basicConsistency.consistencyScore < 70) {
    suggestions.push({
      type: 'consistency',
      priority: 'high',
      message: 'Character consistency could be improved',
      details: 'Focus on maintaining character traits and appearance descriptions'
    })
  }

  // Based on enhanced consistency
  if (enhancedConsistency.behaviorScore && enhancedConsistency.behaviorScore < 60) {
    suggestions.push({
      type: 'behavior',
      priority: 'medium',
      message: 'Character behavior seems inconsistent',
      details: 'Make sure character actions align with their personality'
    })
  }

  // Based on real-time feedback
  if (realTimeFeedback.overallScore < 50) {
    suggestions.push({
      type: 'immediate',
      priority: 'high',
      message: 'Consider revising current content',
      details: realTimeFeedback.suggestions.join('. ')
    })
  }

  // Positive reinforcement
  if (realTimeFeedback.overallScore > 80) {
    suggestions.push({
      type: 'positive',
      priority: 'low',
      message: 'Great character consistency!',
      details: 'The character is well-represented in this story'
    })
  }

  return suggestions
}

function getTraitSynonyms(trait: string): string {
  const synonyms: Record<string, string[]> = {
    'brave': ['courageous', 'fearless', 'bold', 'heroic'],
    'kind': ['gentle', 'caring', 'compassionate', 'sweet'],
    'funny': ['humorous', 'witty', 'silly', 'amusing'],
    'smart': ['intelligent', 'clever', 'wise', 'brilliant'],
    'shy': ['timid', 'quiet', 'reserved', 'bashful']
  }
  
  return synonyms[trait.toLowerCase()]?.join('|') || trait
}
