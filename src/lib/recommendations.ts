// Recommendation Engine for StoryNest
// Beta Phase - Character preference-based story recommendations

export interface StoryRecommendation {
  id: string
  title: string
  summary: string
  recommendationReason: string
  matchScore: number
  recommendedCharacters?: string[]
  themes: string[]
  ageGroups: string[]
  estimatedReadTime: number
}

export interface EnhancedRecommendation {
  id: string
  type: 'character_development' | 'story_theme' | 'narrative_style' | 'character_interaction'
  title: string
  description: string
  reasoning: string
  confidence: number
  impact: 'low' | 'medium' | 'high'
  implementationDifficulty: 'easy' | 'moderate' | 'challenging'
  personalizedFactors: string[]
  characterIds?: string[]
  actionable_steps: string[]
  priority: number
}

export interface CharacterPreference {
  characterId: string
  characterName: string
  timesUsed: number
  favoriteThemes: string[]
  lastUsed: Date
  userRating?: number
}

export interface RecommendationContext {
  childProfileId: string
  childAge: number
  readingHistory: string[]
  favoriteCharacters: CharacterPreference[]
  favoriteThemes: string[]
  readingLevel: 'beginner' | 'intermediate' | 'advanced'
  lastSessionTime?: Date
  // Beta Phase enhancements
  characterIds?: string[]
  currentStoryContext?: string
  enhanced?: boolean
  userEngagementMetrics?: {
    characterReuseRate: number
    averageReadingTime: number
    streakDays: number
    weeklyActiveHours: number
  }
}

// Story themes and their character compatibility
const THEME_CHARACTER_COMPATIBILITY = {
  'adventure': ['brave', 'curious', 'adventurous', 'clever'],
  'friendship': ['kind', 'helpful', 'gentle', 'loyal'],
  'learning': ['wise', 'curious', 'clever', 'patient'],
  'magic': ['magical', 'wise', 'mysterious', 'powerful'],
  'nature': ['gentle', 'curious', 'adventurous', 'caring'],
  'problem-solving': ['clever', 'brave', 'helpful', 'creative'],
  'bedtime': ['gentle', 'calm', 'wise', 'comforting'],
  'family': ['kind', 'loving', 'helpful', 'caring'],
  'seasonal': ['cheerful', 'adventurous', 'curious', 'festive'],
  'moral-lesson': ['wise', 'kind', 'honest', 'brave']
} as const

// Character traits that work well together - for future feature expansion
// const CHARACTER_SYNERGY = {
//   'brave': ['adventurous', 'loyal', 'protective'],
//   'wise': ['patient', 'kind', 'mysterious'],
//   'curious': ['adventurous', 'clever', 'energetic'],
//   'gentle': ['kind', 'caring', 'peaceful'],
//   'funny': ['cheerful', 'creative', 'playful'],
//   'magical': ['mysterious', 'wise', 'powerful']
// } as const

export class RecommendationEngine {
  
  /**
   * Generate personalized story recommendations based on child preferences and character usage
   */
  static async generateRecommendations(context: RecommendationContext): Promise<StoryRecommendation[]> {
    const recommendations: StoryRecommendation[] = []
    
    // 1. Character-continuation recommendations
    const characterRecommendations = this.getCharacterContinuationRecommendations(context)
    recommendations.push(...characterRecommendations)
    
    // 2. Theme-based recommendations
    const themeRecommendations = this.getThemeBasedRecommendations(context)
    recommendations.push(...themeRecommendations)
    
    // 3. Discovery recommendations (new characters/themes)
    const discoveryRecommendations = this.getDiscoveryRecommendations(context)
    recommendations.push(...discoveryRecommendations)
    
    // 4. Seasonal/timely recommendations
    const seasonalRecommendations = this.getSeasonalRecommendations(context)
    recommendations.push(...seasonalRecommendations)
    
    // Sort by match score and return top recommendations
    return recommendations
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 8) // Return top 8 recommendations
  }
  
  /**
   * Recommend continuing adventures with favorite characters
   */
  private static getCharacterContinuationRecommendations(context: RecommendationContext): StoryRecommendation[] {
    const recommendations: StoryRecommendation[] = []
    
    // Get top 3 favorite characters
    const topCharacters = context.favoriteCharacters
      .sort((a, b) => b.timesUsed - a.timesUsed)
      .slice(0, 3)
    
    topCharacters.forEach(character => {
      // Find themes this character hasn't explored yet
      const unexploredThemes = this.getUnexploredThemes(character, context.favoriteThemes)
      
      unexploredThemes.slice(0, 2).forEach(theme => {
        recommendations.push({
          id: `char-${character.characterId}-${theme}`,
          title: this.generateStoryTitle(character.characterName, theme),
          summary: this.generateStorySummary(character.characterName, theme),
          recommendationReason: `Continue ${character.characterName}'s adventures with a new ${theme} story!`,
          matchScore: 90 + (character.timesUsed * 2), // High score for favorite characters
          recommendedCharacters: [character.characterId],
          themes: [theme],
          ageGroups: this.getAgeGroupsForAge(context.childAge),
          estimatedReadTime: this.estimateReadTime(context.childAge)
        })
      })
    })
    
    return recommendations
  }
  
  /**
   * Recommend stories based on favorite themes with character compatibility
   */
  private static getThemeBasedRecommendations(context: RecommendationContext): StoryRecommendation[] {
    const recommendations: StoryRecommendation[] = []
    
    context.favoriteThemes.slice(0, 3).forEach(theme => {
      // Find characters that would work well with this theme
      const compatibleTraits = THEME_CHARACTER_COMPATIBILITY[theme as keyof typeof THEME_CHARACTER_COMPATIBILITY] || []
      const compatibleCharacters = context.favoriteCharacters.filter(char => 
        char.favoriteThemes.some(charTheme => 
          (compatibleTraits as readonly string[]).includes(charTheme)
        )
      )
      
      if (compatibleCharacters.length > 0) {
        const bestCharacter = compatibleCharacters[0]
        recommendations.push({
          id: `theme-${theme}-${bestCharacter.characterId}`,
          title: this.generateStoryTitle(bestCharacter.characterName, theme),
          summary: this.generateStorySummary(bestCharacter.characterName, theme),
          recommendationReason: `Perfect ${theme} adventure for ${bestCharacter.characterName}!`,
          matchScore: 85,
          recommendedCharacters: [bestCharacter.characterId],
          themes: [theme],
          ageGroups: this.getAgeGroupsForAge(context.childAge),
          estimatedReadTime: this.estimateReadTime(context.childAge)
        })
      } else {
        // Suggest creating a new character for this theme
        recommendations.push({
          id: `theme-new-${theme}`,
          title: this.generateGenericStoryTitle(theme),
          summary: this.generateGenericStorySummary(theme),
          recommendationReason: `Create a new character perfect for ${theme} stories!`,
          matchScore: 75,
          themes: [theme],
          ageGroups: this.getAgeGroupsForAge(context.childAge),
          estimatedReadTime: this.estimateReadTime(context.childAge)
        })
      }
    })
    
    return recommendations
  }
  
  /**
   * Recommend new characters and themes for discovery
   */
  private static getDiscoveryRecommendations(context: RecommendationContext): StoryRecommendation[] {
    const recommendations: StoryRecommendation[] = []
    
    // Suggest character combinations that haven't been tried
    const characterPairs = this.suggestCharacterPairs(context.favoriteCharacters)
    
    characterPairs.slice(0, 2).forEach(pair => {
      const sharedThemes = this.findSharedThemes(pair[0], pair[1])
      if (sharedThemes.length > 0) {
        const theme = sharedThemes[0]
        recommendations.push({
          id: `discovery-${pair[0].characterId}-${pair[1].characterId}-${theme}`,
          title: `${pair[0].characterName} and ${pair[1].characterName}'s ${theme} Adventure`,
          summary: `Watch ${pair[0].characterName} and ${pair[1].characterName} work together in an exciting ${theme} story!`,
          recommendationReason: 'Try a team adventure with your favorite characters!',
          matchScore: 70,
          recommendedCharacters: [pair[0].characterId, pair[1].characterId],
          themes: [theme],
          ageGroups: this.getAgeGroupsForAge(context.childAge),
          estimatedReadTime: this.estimateReadTime(context.childAge)
        })
      }
    })
    
    return recommendations
  }
  
  /**
   * Get seasonal and timely story recommendations
   */
  private static getSeasonalRecommendations(context: RecommendationContext): StoryRecommendation[] {
    const recommendations: StoryRecommendation[] = []
    const currentSeason = this.getCurrentSeason()
    const upcomingHolidays = this.getUpcomingHolidays()
    
    // Seasonal recommendation
    if (context.favoriteCharacters.length > 0) {
      const character = context.favoriteCharacters[0]
      recommendations.push({
        id: `seasonal-${currentSeason}-${character.characterId}`,
        title: `${character.characterName}'s ${currentSeason} Adventure`,
        summary: `Join ${character.characterName} in a special ${currentSeason} story full of seasonal magic!`,
        recommendationReason: `Perfect for ${currentSeason} season!`,
        matchScore: 65,
        recommendedCharacters: [character.characterId],
        themes: ['seasonal', 'nature'],
        ageGroups: this.getAgeGroupsForAge(context.childAge),
        estimatedReadTime: this.estimateReadTime(context.childAge)
      })
    }
    
    // Holiday recommendations
    upcomingHolidays.slice(0, 1).forEach(holiday => {
      if (context.favoriteCharacters.length > 0) {
        const character = context.favoriteCharacters[0]
        recommendations.push({
          id: `holiday-${holiday}-${character.characterId}`,
          title: `${character.characterName}'s ${holiday} Celebration`,
          summary: `Celebrate ${holiday} with ${character.characterName} in this festive story!`,
          recommendationReason: `Get ready for ${holiday}!`,
          matchScore: 80, // Higher score for timely content
          recommendedCharacters: [character.characterId],
          themes: ['seasonal', 'family'],
          ageGroups: this.getAgeGroupsForAge(context.childAge),
          estimatedReadTime: this.estimateReadTime(context.childAge)
        })
      }
    })
    
    return recommendations
  }
  
  /**
   * Beta Phase: Generate enhanced recommendations with advanced analytics
   */
  static async generateEnhancedRecommendations(context: RecommendationContext): Promise<EnhancedRecommendation[]> {
    const recommendations: EnhancedRecommendation[] = []
    
    // Character development recommendations
    const characterDevRecs = await this.getCharacterDevelopmentRecommendations(context)
    recommendations.push(...characterDevRecs)
    
    // Story theme recommendations based on engagement patterns
    const themeRecs = await this.getAdvancedThemeRecommendations(context)
    recommendations.push(...themeRecs)
    
    // Character interaction recommendations
    const interactionRecs = await this.getCharacterInteractionRecommendations(context)
    recommendations.push(...interactionRecs)
    
    // Narrative style recommendations
    const narrativeRecs = await this.getNarrativeStyleRecommendations(context)
    recommendations.push(...narrativeRecs)
    
    // Sort by priority and confidence
    return recommendations
      .sort((a, b) => (b.priority * b.confidence) - (a.priority * a.confidence))
      .slice(0, 8) // Return top 8 recommendations
  }

  /**
   * Get character development recommendations based on usage patterns
   */
  private static async getCharacterDevelopmentRecommendations(context: RecommendationContext): Promise<EnhancedRecommendation[]> {
    const recommendations: EnhancedRecommendation[] = []
    
    // Analyze character usage patterns
    const underusedCharacters = context.favoriteCharacters.filter(char => {
      const daysSinceLastUse = (Date.now() - char.lastUsed.getTime()) / (1000 * 60 * 60 * 24)
      return daysSinceLastUse > 7 && char.timesUsed >= 2
    })
    
    if (underusedCharacters.length > 0) {
      const character = underusedCharacters[0]
      recommendations.push({
        id: `char-dev-${character.characterId}`,
        type: 'character_development',
        title: `Rediscover ${character.characterName}`,
        description: `${character.characterName} hasn't been in a story for a while. Create a new adventure to explore their character further!`,
        reasoning: `Character usage analysis shows ${character.characterName} was popular but hasn't been used recently. Reintroducing familiar characters can boost engagement.`,
        confidence: 85,
        impact: 'medium',
        implementationDifficulty: 'easy',
        personalizedFactors: [`Last used ${Math.floor((Date.now() - character.lastUsed.getTime()) / (1000 * 60 * 60 * 24))} days ago`, 'Previously enjoyed character'],
        characterIds: [character.characterId],
        actionable_steps: [
          `Create a new story featuring ${character.characterName}`,
          'Explore new personality aspects or abilities',
          'Try a different theme than previous stories',
          'Consider character growth or learning moments'
        ],
        priority: 70
      })
    }
    
    // Recommend character trait expansion
    if (context.favoriteCharacters.length >= 2) {
      const topCharacter = context.favoriteCharacters[0]
      recommendations.push({
        id: `trait-expansion-${topCharacter.characterId}`,
        type: 'character_development',
        title: `Expand ${topCharacter.characterName}'s Personality`,
        description: 'Add new personality traits or abilities to make your favorite character even more interesting!',
        reasoning: 'Character consistency analysis suggests adding complementary traits can enhance storytelling depth while maintaining character recognition.',
        confidence: 78,
        impact: 'high',
        implementationDifficulty: 'moderate',
        personalizedFactors: ['Most used character', 'High engagement potential'],
        characterIds: [topCharacter.characterId],
        actionable_steps: [
          'Add 1-2 new personality traits',
          'Give them a special skill or hobby',
          'Create a backstory element',
          'Test in a short story first'
        ],
        priority: 65
      })
    }
    
    return recommendations
  }

  /**
   * Get advanced theme recommendations based on engagement patterns
   */
  private static async getAdvancedThemeRecommendations(context: RecommendationContext): Promise<EnhancedRecommendation[]> {
    const recommendations: EnhancedRecommendation[] = []
    
    // Analyze theme patterns
    const themeCounts = context.favoriteThemes.reduce((acc, theme) => {
      acc[theme] = (acc[theme] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const underexploredThemes = Object.keys(THEME_CHARACTER_COMPATIBILITY)
      .filter(theme => !context.favoriteThemes.includes(theme) || (themeCounts[theme] || 0) < 2)
    
    if (underexploredThemes.length > 0) {
      const suggestedTheme = underexploredThemes[0]
      const compatibleCharacter = context.favoriteCharacters.find(char => 
        THEME_CHARACTER_COMPATIBILITY[suggestedTheme as keyof typeof THEME_CHARACTER_COMPATIBILITY]
          ?.some(trait => char.favoriteThemes.includes(trait))
      )
      
      recommendations.push({
        id: `theme-explore-${suggestedTheme}`,
        type: 'story_theme',
        title: `Try ${suggestedTheme.charAt(0).toUpperCase() + suggestedTheme.slice(1)} Stories`,
        description: `Explore ${suggestedTheme} themes to add variety to your storytelling experience.`,
        reasoning: `Theme analysis shows limited exploration of ${suggestedTheme} stories, which could provide new engagement opportunities.`,
        confidence: 72,
        impact: 'medium',
        implementationDifficulty: 'easy',
        personalizedFactors: ['Unexplored theme', compatibleCharacter ? `Works well with ${compatibleCharacter.characterName}` : 'New story direction'],
        characterIds: compatibleCharacter ? [compatibleCharacter.characterId] : undefined,
        actionable_steps: [
          `Create a ${suggestedTheme}-themed story`,
          compatibleCharacter ? `Feature ${compatibleCharacter.characterName}` : 'Choose a suitable character',
          'Start with a simple plot',
          'Focus on theme-specific vocabulary'
        ],
        priority: 60
      })
    }
    
    return recommendations
  }

  /**
   * Get character interaction recommendations
   */
  private static async getCharacterInteractionRecommendations(context: RecommendationContext): Promise<EnhancedRecommendation[]> {
    const recommendations: EnhancedRecommendation[] = []
    
    if (context.favoriteCharacters.length >= 2) {
      const char1 = context.favoriteCharacters[0]
      const char2 = context.favoriteCharacters[1]
      
      recommendations.push({
        id: `char-interaction-${char1.characterId}-${char2.characterId}`,
        type: 'character_interaction',
        title: `${char1.characterName} Meets ${char2.characterName}`,
        description: 'Create a story where your favorite characters interact and go on an adventure together!',
        reasoning: 'Multi-character stories can boost engagement and create more complex, interesting narratives.',
        confidence: 82,
        impact: 'high',
        implementationDifficulty: 'moderate',
        personalizedFactors: ['Top 2 favorite characters', 'High engagement potential'],
        characterIds: [char1.characterId, char2.characterId],
        actionable_steps: [
          'Choose a setting where both characters can meet',
          'Create a problem they need to solve together',
          'Highlight each character\'s unique strengths',
          'Show how they complement each other'
        ],
        priority: 75
      })
    }
    
    return recommendations
  }

  /**
   * Get narrative style recommendations
   */
  private static async getNarrativeStyleRecommendations(context: RecommendationContext): Promise<EnhancedRecommendation[]> {
    const recommendations: EnhancedRecommendation[] = []
    
    // Recommend interactive elements based on engagement
    if (context.userEngagementMetrics?.weeklyActiveHours && context.userEngagementMetrics.weeklyActiveHours > 2) {
      recommendations.push({
        id: 'narrative-interactive',
        type: 'narrative_style',
        title: 'Try Interactive Story Elements',
        description: 'Add choices, questions, or interactive elements to make stories more engaging.',
        reasoning: 'High engagement metrics suggest readiness for more complex, interactive storytelling formats.',
        confidence: 76,
        impact: 'medium',
        implementationDifficulty: 'challenging',
        personalizedFactors: ['High weekly engagement', 'Ready for advanced features'],
        actionable_steps: [
          'Add choice points in stories',
          'Include questions for the reader',
          'Create "what would you do?" moments',
          'Experiment with different endings'
        ],
        priority: 55
      })
    }
    
    return recommendations
  }

  // Helper methods
  private static getUnexploredThemes(character: CharacterPreference, favoriteThemes: string[]): string[] {
    const allThemes = Object.keys(THEME_CHARACTER_COMPATIBILITY)
    return allThemes.filter(theme => 
      !character.favoriteThemes.includes(theme) && favoriteThemes.includes(theme)
    )
  }
  
  private static suggestCharacterPairs(characters: CharacterPreference[]): [CharacterPreference, CharacterPreference][] {
    const pairs: [CharacterPreference, CharacterPreference][] = []
    for (let i = 0; i < characters.length - 1; i++) {
      for (let j = i + 1; j < characters.length; j++) {
        pairs.push([characters[i], characters[j]])
      }
    }
    return pairs
  }
  
  private static findSharedThemes(char1: CharacterPreference, char2: CharacterPreference): string[] {
    return char1.favoriteThemes.filter(theme => char2.favoriteThemes.includes(theme))
  }
  
  private static generateStoryTitle(characterName: string, theme: string): string {
    const titles = {
      'adventure': [`${characterName}'s Great Adventure`, `${characterName} Explores the Unknown`],
      'friendship': [`${characterName} Makes a New Friend`, `${characterName}'s Friendship Journey`],
      'learning': [`${characterName} Learns Something New`, `${characterName}'s Discovery`],
      'magic': [`${characterName}'s Magical Quest`, `${characterName} and the Magic Secret`],
      'nature': [`${characterName} in the Enchanted Forest`, `${characterName}'s Nature Walk`],
      'problem-solving': [`${characterName} Solves the Mystery`, `${characterName}'s Clever Solution`],
      'bedtime': [`${characterName}'s Peaceful Night`, `${characterName}'s Sleepy Adventure`],
      'family': [`${characterName}'s Family Time`, `${characterName} Helps at Home`],
      'seasonal': [`${characterName}'s Seasonal Journey`, `${characterName} and the Changing Seasons`],
      'moral-lesson': [`${characterName} Learns About Kindness`, `${characterName}'s Important Lesson`]
    }
    
    const themeTitle = titles[theme as keyof typeof titles] || [`${characterName}'s Story`]
    return themeTitle[Math.floor(Math.random() * themeTitle.length)]
  }
  
  private static generateStorySummary(characterName: string, theme: string): string {
    const summaries = {
      'adventure': `Join ${characterName} on an exciting adventure full of surprises and discoveries!`,
      'friendship': `${characterName} learns the value of friendship in this heartwarming tale.`,
      'learning': `Follow ${characterName} as they discover something amazing and new.`,
      'magic': `${characterName} encounters magical wonders in this enchanting story.`,
      'nature': `${characterName} explores the beauty of nature and meets woodland friends.`,
      'problem-solving': `Watch ${characterName} use cleverness and creativity to solve an important problem.`,
      'bedtime': `A gentle, soothing story with ${characterName} perfect for bedtime.`,
      'family': `${characterName} enjoys special time with family and learns about love and togetherness.`,
      'seasonal': `${characterName} experiences the magic and wonder of the changing seasons.`,
      'moral-lesson': `${characterName} learns an important life lesson about being kind and good.`
    }
    
    return summaries[theme as keyof typeof summaries] || `A wonderful story featuring ${characterName}.`
  }
  
  private static generateGenericStoryTitle(theme: string): string {
    const titles = {
      'adventure': 'The Great Adventure Awaits',
      'friendship': 'A New Friendship Begins',
      'learning': 'The Amazing Discovery',
      'magic': 'The Magical Quest',
      'nature': 'Into the Enchanted Forest',
      'problem-solving': 'The Mystery Solution',
      'bedtime': 'A Peaceful Night Story',
      'family': 'Family Love and Joy',
      'seasonal': 'Seasonal Magic',
      'moral-lesson': 'An Important Lesson'
    }
    
    return titles[theme as keyof typeof titles] || 'A Wonderful Story'
  }
  
  private static generateGenericStorySummary(theme: string): string {
    const summaries = {
      'adventure': 'An exciting adventure story full of surprises and fun discoveries!',
      'friendship': 'A heartwarming tale about the magic of friendship and caring for others.',
      'learning': 'A story about curiosity, discovery, and the joy of learning new things.',
      'magic': 'An enchanting tale filled with magical wonders and amazing surprises.',
      'nature': 'A beautiful story about exploring nature and meeting wonderful creatures.',
      'problem-solving': 'A clever story about using creativity and thinking to solve problems.',
      'bedtime': 'A gentle, peaceful story perfect for drifting off to dreamland.',
      'family': 'A loving story about family bonds, togetherness, and caring for each other.',
      'seasonal': 'A delightful story celebrating the beauty and magic of the seasons.',
      'moral-lesson': 'An inspiring story that teaches important lessons about being good and kind.'
    }
    
    return summaries[theme as keyof typeof summaries] || 'A wonderful story perfect for young readers.'
  }
  
  private static getAgeGroupsForAge(age: number): string[] {
    if (age <= 3) return ['1-3']
    if (age <= 6) return ['3-6']
    if (age <= 10) return ['7-10']
    return ['11-12']
  }
  
  private static estimateReadTime(age: number): number {
    // Reading time in minutes based on age
    if (age <= 3) return 5
    if (age <= 6) return 8
    if (age <= 10) return 12
    return 15
  }
  
  private static getCurrentSeason(): string {
    const month = new Date().getMonth()
    if (month >= 2 && month <= 4) return 'Spring'
    if (month >= 5 && month <= 7) return 'Summer'
    if (month >= 8 && month <= 10) return 'Fall'
    return 'Winter'
  }
  
  private static getUpcomingHolidays(): string[] {
    const month = new Date().getMonth()
    const day = new Date().getDate()
    
    const holidays = []
    
    // Check for upcoming holidays (simplified)
    if (month === 9 && day < 31) holidays.push('Halloween')
    if (month === 10 && day < 25) holidays.push('Thanksgiving')
    if (month === 11 && day < 25) holidays.push('Christmas')
    if (month === 0 && day < 1) holidays.push("New Year's Day")
    if (month === 1 && day < 14) holidays.push("Valentine's Day")
    if (month === 2 && day < 17) holidays.push("St. Patrick's Day")
    if (month === 3 && day < 22) holidays.push('Easter')
    if (month === 6 && day < 4) holidays.push('Fourth of July')
    
    return holidays
  }
  
  /**
   * Track user interaction with recommendations for improvement
   */
  static async trackRecommendationInteraction(
    recommendationId: string,
    action: 'viewed' | 'clicked' | 'created' | 'dismissed',
    context: RecommendationContext
  ): Promise<void> {
    // In a real implementation, this would track analytics
    console.log(`Recommendation ${recommendationId} ${action} by child ${context.childProfileId}`)
    
    // This data would be used to improve future recommendations
    // by understanding what types of recommendations users prefer
  }
  
  /**
   * Get quick recommendations for dashboard display
   */
  static async getQuickRecommendations(context: RecommendationContext): Promise<StoryRecommendation[]> {
    const allRecommendations = await this.generateRecommendations(context)
    return allRecommendations.slice(0, 3) // Return top 3 for dashboard
  }
}
