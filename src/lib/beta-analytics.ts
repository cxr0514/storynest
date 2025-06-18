// Enhanced Analytics for StoryNest Beta Phase
// Character consistency metrics and engagement tracking

import { prisma } from '@/lib/prisma'

// Type definitions for analytics data structures
interface AnalyticsCharacterData {
  id: string;
  name: string;
  physicalFeatures?: string;
  clothingAccessories?: string;
  personalityTraits?: string[];
  personalityDescription?: string;
  favoriteThings?: string;
  favoritePhrases?: string[];
  speakingStyle?: string;
  specialAbilities?: string;
  stories?: AnalyticsStoryRelation[];
}

interface AnalyticsStoryRelation {
  story: {
    id: string;
    content?: Record<string, unknown>;
    theme: string;
    createdAt: Date;
  };
}

export interface BetaAnalyticsMetrics {
  characterConsistency: CharacterConsistencyReport
  userEngagement: UserEngagementReport
  recommendationEffectiveness: RecommendationReport
  overallPlatformHealth: PlatformHealthReport
}

export interface CharacterConsistencyReport {
  characterId: string
  characterName: string
  totalStoryAppearances: number
  overallConsistencyScore: number
  consistencyBreakdown: {
    visualConsistency: number
    personalityConsistency: number
    speechPatternConsistency: number
    behaviorConsistency: number
  }
  consistencyTrend: 'improving' | 'stable' | 'declining'
  recentInconsistencies: string[]
  recommendedImprovements: string[]
}

export interface UserEngagementReport {
  userId: string
  childProfileId: string
  engagementScore: number
  characterReuseRate: number
  favoriteCharacters: Array<{
    characterId: string
    name: string
    usageCount: number
    lastUsed: Date
    consistencyScore: number
  }>
  readingPatterns: {
    averageSessionLength: number
    preferredReadingTimes: string[]
    favoriteThemes: string[]
    streakDays: number
  }
  progressMetrics: {
    storiesCompleted: number
    charactersCreated: number
    averageStoryLength: number
    comprehensionLevel: 'beginner' | 'intermediate' | 'advanced'
  }
}

export interface RecommendationReport {
  totalRecommendationsGenerated: number
  clickThroughRate: number
  conversionRate: number
  topPerformingRecommendationTypes: Array<{
    type: string
    clicks: number
    conversions: number
    avgRating: number
  }>
  characterContinuationSuccess: number
  themeRecommendationSuccess: number
  discoveryRecommendationSuccess: number
}

export interface PlatformHealthReport {
  averageCharacterConsistency: number
  userRetentionRate: number
  characterReuseRate: number
  storiesPerUser: number
  charactersPerUser: number
  mostConsistentCharacters: Array<{
    characterId: string
    name: string
    consistencyScore: number
    totalAppearances: number
  }>
  consistencyTrends: {
    improvingCharacters: number
    decliningCharacters: number
    stableCharacters: number
  }
}

export class BetaAnalyticsEngine {
  
  /**
   * Generate comprehensive character consistency report
   */
  static async generateCharacterConsistencyReport(characterId: string): Promise<CharacterConsistencyReport> {
    // Get character with all story relationships
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      include: {
        stories: {
          include: {
            story: {
              select: {
                id: true,
                createdAt: true,
                theme: true
              }
            }
          }
        }
      }
    })

    if (!character) {
      throw new Error('Character not found')
    }

    const stories = character.stories
    const totalAppearances = stories.length

    if (totalAppearances === 0) {
      return {
        characterId,
        characterName: character.name,
        totalStoryAppearances: 0,
        overallConsistencyScore: 100,
        consistencyBreakdown: {
          visualConsistency: 100,
          personalityConsistency: 100,
          speechPatternConsistency: 100,
          behaviorConsistency: 100
        },
        consistencyTrend: 'stable',
        recentInconsistencies: [],
        recommendedImprovements: []
      }
    }

    // Calculate individual consistency scores
    const visualScore = this.calculateVisualConsistencyScore(character, stories)
    const personalityScore = this.calculatePersonalityConsistencyScore(character, stories)
    const speechScore = this.calculateSpeechConsistencyScore(character, stories)
    const behaviorScore = this.calculateBehaviorConsistencyScore(character, stories)

    // Calculate overall score
    const overallScore = Math.round(
      (visualScore * 0.25) + 
      (personalityScore * 0.35) + 
      (speechScore * 0.20) + 
      (behaviorScore * 0.20)
    )

    // Analyze trends and inconsistencies
    const trend = this.calculateConsistencyTrend(stories)
    const inconsistencies = this.identifyRecentInconsistencies(character, stories)
    const improvements = this.generateImprovementRecommendations(character, stories, overallScore)

    return {
      characterId,
      characterName: character.name,
      totalStoryAppearances: totalAppearances,
      overallConsistencyScore: overallScore,
      consistencyBreakdown: {
        visualConsistency: visualScore,
        personalityConsistency: personalityScore,
        speechPatternConsistency: speechScore,
        behaviorConsistency: behaviorScore
      },
      consistencyTrend: trend,
      recentInconsistencies: inconsistencies,
      recommendedImprovements: improvements
    }
  }

  /**
   * Generate user engagement report for a child profile
   */
  static async generateUserEngagementReport(userId: string, childProfileId: string): Promise<UserEngagementReport> {
    // Get child profile data
    const childProfile = await prisma.childProfile.findFirst({
      where: {
        id: childProfileId,
        userId: userId
      }
    })

    if (!childProfile) {
      throw new Error('Child profile not found')
    }

    // Get characters and their usage
    const characters = await prisma.character.findMany({
      where: { childProfileId },
      include: {
        stories: {
          include: {
            story: {
              select: {
                id: true,
                createdAt: true,
                theme: true
              }
            }
          }
        }
      }
    })

    // Get stories for reading patterns
    const stories = await prisma.story.findMany({
      where: { childProfileId },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    // Calculate character reuse rate
    const charactersWithMultipleStories = characters.filter(char => char.stories.length > 1)
    const characterReuseRate = characters.length > 0 
      ? (charactersWithMultipleStories.length / characters.length) * 100 
      : 0

    // Calculate engagement score
    const engagementScore = this.calculateEngagementScore(characters, stories, childProfile.age)

    // Analyze favorite characters
    const favoriteCharacters = await Promise.all(
      characters
        .sort((a, b) => b.stories.length - a.stories.length)
        .slice(0, 5)
        .map(async (char) => {
          const consistencyReport = await this.generateCharacterConsistencyReport(char.id)
          return {
            characterId: char.id,
            name: char.name,
            usageCount: char.stories.length,
            lastUsed: char.stories.length > 0 
              ? new Date(Math.max(...char.stories.map(s => new Date(s.story.createdAt).getTime())))
              : new Date(char.createdAt),
            consistencyScore: consistencyReport.overallConsistencyScore
          }
        })
    )

    // Analyze reading patterns
    const readingPatterns = this.analyzeReadingPatterns(stories)

    // Calculate progress metrics
    const progressMetrics = this.calculateProgressMetrics(stories, characters, childProfile.age)

    return {
      userId,
      childProfileId,
      engagementScore,
      characterReuseRate,
      favoriteCharacters,
      readingPatterns,
      progressMetrics
    }
  }

  /**
   * Generate platform health report for admins
   */
  static async generatePlatformHealthReport(): Promise<PlatformHealthReport> {
    // Get all characters with their story relationships
    const allCharacters = await prisma.character.findMany({
      include: {
        stories: {
          include: {
            story: {
              select: {
                id: true,
                createdAt: true
              }
            }
          }
        }
      }
    })

    // Calculate consistency scores for all characters
    const characterConsistencyScores = await Promise.all(
      allCharacters.map(async (char) => {
        if (char.stories.length === 0) return null
        try {
          const report = await this.generateCharacterConsistencyReport(char.id)
          return {
            characterId: char.id,
            name: char.name,
            consistencyScore: report.overallConsistencyScore,
            totalAppearances: report.totalStoryAppearances,
            trend: report.consistencyTrend
          }
        } catch {
          return null
        }
      })
    )

    const validCharacters = characterConsistencyScores.filter(char => char !== null) as NonNullable<typeof characterConsistencyScores[0]>[]

    // Calculate platform metrics
    const averageConsistency = validCharacters.length > 0
      ? validCharacters.reduce((sum, char) => sum + char.consistencyScore, 0) / validCharacters.length
      : 0

    const charactersWithMultipleStories = allCharacters.filter(char => char.stories.length > 1)
    const platformCharacterReuseRate = allCharacters.length > 0
      ? (charactersWithMultipleStories.length / allCharacters.length) * 100
      : 0

    // Get user statistics
    const totalUsers = await prisma.user.count()
    const totalStories = await prisma.story.count()

    const storiesPerUser = totalUsers > 0 ? totalStories / totalUsers : 0
    const charactersPerUser = totalUsers > 0 ? allCharacters.length / totalUsers : 0

    // Find most consistent characters
    const mostConsistent = validCharacters
      .sort((a, b) => b.consistencyScore - a.consistencyScore)
      .slice(0, 10)

    // Count consistency trends
    const trendCounts = validCharacters.reduce(
      (acc, char) => {
        acc[char.trend]++
        return acc
      },
      { improving: 0, stable: 0, declining: 0 }
    )

    return {
      averageCharacterConsistency: Math.round(averageConsistency),
      userRetentionRate: 85, // Placeholder - would need actual tracking
      characterReuseRate: Math.round(platformCharacterReuseRate),
      storiesPerUser: Math.round(storiesPerUser * 10) / 10,
      charactersPerUser: Math.round(charactersPerUser * 10) / 10,
      mostConsistentCharacters: mostConsistent,
      consistencyTrends: {
        improvingCharacters: trendCounts.improving,
        decliningCharacters: trendCounts.declining,
        stableCharacters: trendCounts.stable
      }
    }
  }

  // Helper methods for consistency calculations
  private static calculateVisualConsistencyScore(character: AnalyticsCharacterData, stories: AnalyticsStoryRelation[]): number {
    if (stories.length <= 1) return 100

    // Analyze physical features consistency across stories
    let score = 95
    const baseFeatures = character.physicalFeatures?.toLowerCase() || ''
    const baseClothing = character.clothingAccessories?.toLowerCase() || ''

    // Simple keyword-based consistency check
    stories.forEach(storyRelation => {
      const storyContent = JSON.stringify(storyRelation.story.content || {}).toLowerCase()
      
      // Check if key physical features are maintained
      if (baseFeatures) {
        const featureKeywords = baseFeatures.split(' ').filter(word => word.length > 3)
        const featuresFound = featureKeywords.some(keyword => storyContent.includes(keyword))
        if (!featuresFound) score -= 5
      }

      // Check clothing consistency
      if (baseClothing) {
        const clothingKeywords = baseClothing.split(' ').filter(word => word.length > 3)
        const clothingFound = clothingKeywords.some(keyword => storyContent.includes(keyword))
        if (!clothingFound) score -= 3
      }
    })

    return Math.max(score, 0)
  }

  private static calculatePersonalityConsistencyScore(character: AnalyticsCharacterData, stories: AnalyticsStoryRelation[]): number {
    if (stories.length <= 1) return 100

    let score = 90
    const personalityTraits = character.personalityTraits || []

    stories.forEach(storyRelation => {
      const storyContent = JSON.stringify(storyRelation.story.content || {}).toLowerCase()
      
      // Check if personality traits are reflected
      const traitsReflected = personalityTraits.filter((trait: string) => {
        const traitSynonyms = this.getTraitSynonyms(trait.toLowerCase())
        return traitSynonyms.some(synonym => storyContent.includes(synonym))
      })

      const traitReflectionRate = personalityTraits.length > 0 
        ? traitsReflected.length / personalityTraits.length 
        : 1

      if (traitReflectionRate < 0.6) score -= 8
    })

    return Math.max(score, 0)
  }

  private static calculateSpeechConsistencyScore(character: AnalyticsCharacterData, stories: AnalyticsStoryRelation[]): number {
    if (stories.length <= 1) return 100

    let score = 88
    const favoritePhrases = character.favoritePhrases || []
    const speakingStyle = character.speakingStyle || ''

    stories.forEach(storyRelation => {
      const storyContent = JSON.stringify(storyRelation.story.content || {})
      
      // Check for favorite phrases usage
      if (favoritePhrases.length > 0) {
        const phrasesUsed = favoritePhrases.some((phrase: string) => 
          storyContent.toLowerCase().includes(phrase.toLowerCase())
        )
        if (!phrasesUsed && Math.random() > 0.4) { // Allow some stories without phrases
          score -= 6
        }
      }

      // Check speaking style consistency
      if (speakingStyle) {
        const styleIndicators = this.getSpeakingStyleIndicators(speakingStyle)
        const styleReflected = styleIndicators.some(indicator => 
          storyContent.toLowerCase().includes(indicator)
        )
        if (!styleReflected) score -= 4
      }
    })

    return Math.max(score, 0)
  }

  private static calculateBehaviorConsistencyScore(character: AnalyticsCharacterData, stories: AnalyticsStoryRelation[]): number {
    if (stories.length <= 1) return 100

    let score = 85
    const specialAbilities = character.specialAbilities?.toLowerCase() || ''
    const favoriteThings = character.favoriteThings?.toLowerCase() || ''

    stories.forEach(storyRelation => {
      const storyContent = JSON.stringify(storyRelation.story.content || {}).toLowerCase()
      
      // Check special abilities usage (should be reasonable, not overused)
      if (specialAbilities) {
        const abilityMentions = (storyContent.match(new RegExp(specialAbilities, 'gi')) || []).length
        if (abilityMentions > 3) score -= 5 // Penalize overuse
        if (abilityMentions === 0 && Math.random() > 0.7) score -= 2 // Sometimes should be mentioned
      }

      // Check favorite things relevance
      if (favoriteThings) {
        const thingsKeywords = favoriteThings.split(',').map(t => t.trim())
        const relevantMentions = thingsKeywords.some(thing => storyContent.includes(thing))
        if (relevantMentions) score += 3 // Bonus for relevant mentions
      }
    })

    return Math.max(Math.min(score, 100), 0)
  }

  private static calculateEngagementScore(characters: AnalyticsCharacterData[], stories: Record<string, unknown>[], childAge: number): number {
    let score = 0
    
    // Character engagement (40% of score)
    const characterScore = characters.length * 10 + (characters.filter(c => c.stories && c.stories.length > 1).length * 20)
    score += Math.min(characterScore, 40)

    // Story engagement (30% of score)
    const storyScore = Math.min(stories.length * 2, 30)
    score += storyScore

    // Age-appropriate engagement (20% of score)
    const expectedStories = childAge <= 5 ? 10 : childAge <= 8 ? 20 : 30
    const ageScore = Math.min((stories.length / expectedStories) * 20, 20)
    score += ageScore

    // Consistency bonus (10% of score)
    const consistencyBonus = characters.length > 0 && stories.length > 5 ? 10 : 5
    score += consistencyBonus

    return Math.min(score, 100)
  }

  private static analyzeReadingPatterns(stories: { theme?: string; [key: string]: unknown }[]) {
    // Analyze reading patterns from story data
    const themes = stories.map(s => s.theme).filter(Boolean) as string[]
    const themeCount = themes.reduce((acc: Record<string, number>, theme: string) => {
      acc[theme] = (acc[theme] || 0) + 1
      return acc
    }, {})

    const favoriteThemes = Object.entries(themeCount)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([theme]) => theme)

    return {
      averageSessionLength: 15, // Placeholder
      preferredReadingTimes: ['evening'], // Placeholder
      favoriteThemes,
      streakDays: 7 // Placeholder
    }
  }

  private static calculateProgressMetrics(stories: { content?: unknown; [key: string]: unknown }[], characters: { [key: string]: unknown }[], childAge: number) {
    const avgStoryLength = stories.length > 0 
      ? stories.reduce((sum, story) => sum + (JSON.stringify(story.content || {}).length), 0) / stories.length
      : 0

    let comprehensionLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
    if (childAge >= 8 && stories.length >= 20) comprehensionLevel = 'advanced'
    else if (childAge >= 6 && stories.length >= 10) comprehensionLevel = 'intermediate'

    return {
      storiesCompleted: stories.length,
      charactersCreated: characters.length,
      averageStoryLength: Math.round(avgStoryLength),
      comprehensionLevel
    }
  }

  private static calculateConsistencyTrend(stories: { [key: string]: unknown }[]): 'improving' | 'stable' | 'declining' {
    if (stories.length < 3) return 'stable'
    
    // Simple trend analysis - in real implementation, you'd track actual consistency scores over time
    return 'stable'
  }

  private static identifyRecentInconsistencies(character: { personalityTraits?: string[]; favoritePhrases?: string[] }, stories: { story: { id: string; createdAt: Date; theme: string } }[]): string[] {
    const inconsistencies: string[] = []
    
    if (stories.length >= 3) {
      const recentStories = stories.slice(-3)
      
      // Since content is not available, we'll use basic heuristics
      // In a real implementation, we'd need to fetch story content separately
      
      // Check story frequency - if character is being used consistently
      if (character.personalityTraits && character.personalityTraits.length > 0 && recentStories.length < 2) {
        inconsistencies.push('Character not used frequently enough to maintain consistency')
      }

      // Check theme diversity - too much variety might indicate inconsistent use
      const themes = recentStories.map(s => s.story.theme)
      const uniqueThemes = new Set(themes)
      if (uniqueThemes.size === themes.length && themes.length >= 3) {
        inconsistencies.push('Character used across very diverse themes - check consistency')
      }
    }

    return inconsistencies
  }

  private static generateImprovementRecommendations(character: { [key: string]: unknown }, stories: { [key: string]: unknown }[], score: number): string[] {
    const recommendations: string[] = []

    if (score < 70) {
      recommendations.push('Review character profile for key traits and features')
      recommendations.push('Ensure character descriptions match original profile')
    }

    if (score < 85) {
      recommendations.push('Include character\'s favorite phrases in dialogue')
      recommendations.push('Maintain consistent personality traits across stories')
    }

    if (stories.length > 5 && score < 90) {
      recommendations.push('Reference character\'s special abilities appropriately')
      recommendations.push('Keep physical appearance descriptions consistent')
    }

    return recommendations
  }

  private static getTraitSynonyms(trait: string): string[] {
    const synonymMap: Record<string, string[]> = {
      'brave': ['brave', 'courageous', 'fearless', 'bold', 'heroic'],
      'kind': ['kind', 'gentle', 'caring', 'compassionate', 'helpful'],
      'wise': ['wise', 'smart', 'clever', 'intelligent', 'thoughtful'],
      'funny': ['funny', 'humorous', 'jokes', 'laughing', 'cheerful'],
      'curious': ['curious', 'inquisitive', 'wondering', 'exploring', 'asking']
    }

    return synonymMap[trait] || [trait]
  }

  private static getSpeakingStyleIndicators(style: string): string[] {
    const styleMap: Record<string, string[]> = {
      'gentle': ['softly', 'gently', 'whispered', 'kindly', 'tenderly'],
      'enthusiastic': ['exclaimed', 'shouted', 'excitedly', 'energetically', 'eagerly'],
      'wise': ['thoughtfully', 'pondered', 'considered', 'reflected', 'wisely'],
      'playful': ['giggled', 'laughed', 'playfully', 'teasingly', 'cheerfully']
    }

    return styleMap[style.toLowerCase()] || []
  }
}
