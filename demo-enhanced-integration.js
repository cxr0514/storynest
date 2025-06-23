// Enhanced AI Prompt Integration Demonstration
// This script shows how the new AI prompt utilities integrate with StorynestAI

const { 
  generateStoryIllustrationWithConsistency,
  StoryCharacterConsistencyManager,
  enhanceExistingStoryGeneration
} = require('./lib/enhanced-ai-prompt-integration');

// Simulate the existing StorynestAI data structure
const mockStorynestCharacters = [
  {
    id: 'char_001',
    name: 'Luna',
    species: 'Dragon',
    physicalFeatures: 'purple scales with silver belly, tiny delicate wings',
    clothingAccessories: 'small crystal pendant around neck',
    traits: ['curious', 'brave', 'kind-hearted']
  },
  {
    id: 'char_002', 
    name: 'Sparkle',
    species: 'Unicorn',
    physicalFeatures: 'white coat with rainbow mane, golden horn',
    clothingAccessories: 'flower crown made of daisies',
    traits: ['magical', 'gentle', 'wise']
  }
];

const mockStoryData = {
  title: "Luna and Sparkle's Magical Adventure",
  pages: [
    {
      number: 1,
      text: "Luna the dragon was flying through the enchanted forest when she spotted something glittering by the waterfall.",
      illustrationPrompt: "Dragon flying over forest waterfall"
    },
    {
      number: 2, 
      text: "There, drinking from the crystal-clear water, was Sparkle the unicorn with her beautiful rainbow mane.",
      illustrationPrompt: "Unicorn drinking from waterfall"
    },
    {
      number: 3,
      text: "Luna landed gently and introduced herself. Sparkle smiled warmly and they quickly became friends.",
      illustrationPrompt: "Dragon and unicorn meeting by waterfall"
    },
    {
      number: 4,
      text: "Together they discovered a hidden cave behind the waterfall, filled with glowing magical crystals.",
      illustrationPrompt: "Dragon and unicorn in crystal cave"
    }
  ]
};

async function demonstrateEnhancedPromptGeneration() {
  console.log('🎨 === ENHANCED AI PROMPT INTEGRATION DEMO ===\\n');

  try {
    // 1. Demonstrate single page illustration generation
    console.log('📝 SINGLE PAGE ILLUSTRATION GENERATION');
    console.log('=' .repeat(50));
    
    const page1Result = await generateStoryIllustrationWithConsistency(
      {
        number: 1,
        text: mockStoryData.pages[0].text,
        characterDescriptions: { 'char_001': 'Luna appears with purple scales' }
      },
      [mockStorynestCharacters[0]], // Just Luna
      'Fantasy',
      mockStoryData.title
    );

    console.log('📋 Structured YAML Prompt:');
    console.log(page1Result.structuredPrompt);
    console.log('\\n🎨 DALL-E Ready Prompt:');
    console.log(page1Result.dallePrompt);
    console.log('\\n🧠 Character Memory:');
    console.log(page1Result.characterMemory);

    console.log('\\n\\n');

    // 2. Demonstrate full story enhancement
    console.log('📚 FULL STORY ENHANCEMENT');
    console.log('=' .repeat(50));

    const enhancedResult = await enhanceExistingStoryGeneration(
      mockStoryData,
      mockStorynestCharacters,
      'Fantasy'
    );

    console.log(`✨ Enhanced "${enhancedResult.enhancedStory.title}"`);
    console.log(`📖 ${enhancedResult.enhancedStory.pages.length} pages with enhanced prompts\\n`);

    enhancedResult.enhancedStory.pages.forEach((page, index) => {
      console.log(`--- PAGE ${page.number} ---`);
      console.log(`Original: "${page.text.substring(0, 80)}..."`);
      if (page.enhancedIllustrationPrompt) {
        console.log(`Enhanced Prompt: "${page.enhancedIllustrationPrompt.substring(0, 120)}..."`);
      }
      console.log('');
    });

    // 3. Demonstrate character consistency management
    console.log('🎭 CHARACTER CONSISTENCY MANAGEMENT');
    console.log('=' .repeat(50));

    const consistencyManager = enhancedResult.consistencyManager;
    
    console.log('Character Memories:');
    Object.entries(enhancedResult.characterMemories).forEach(([name, memory]) => {
      console.log(`\\n${name}:`);
      console.log(memory);
    });

    // Simulate consistency check
    const mockPages = mockStoryData.pages.map(page => ({
      characterDescriptions: {
        'Luna': 'Luna appears with purple scales and tiny wings',
        'Sparkle': 'Sparkle appears with white coat and rainbow mane'
      }
    }));

    const consistencyReport = consistencyManager.generateConsistencyReport(mockPages);
    console.log('\\n📊 CONSISTENCY REPORT:');
    console.log(`Score: ${consistencyReport.score}%`);
    console.log(`Notes: ${consistencyReport.notes.length ? consistencyReport.notes.join(', ') : 'All characters consistent!'}`);

    console.log('\\n\\n');

    // 4. Show how it integrates with existing DALL-E generation
    console.log('🔗 DALL-E INTEGRATION EXAMPLE');
    console.log('=' .repeat(50));

    console.log('Before Integration (Original StorynestAI):');
    console.log(`"${mockStoryData.pages[0].illustrationPrompt}"`);
    
    console.log('\\nAfter Integration (Enhanced):');
    const enhanced = enhancedResult.enhancedStory.pages[0];
    if (enhanced.enhancedIllustrationPrompt) {
      console.log(`"${enhanced.enhancedIllustrationPrompt}"`);
    }

    console.log('\\n✅ Integration demonstration complete!');
    console.log('\\n🎯 Benefits:');
    console.log('• Character consistency across all pages');
    console.log('• Structured YAML metadata for future AI features');
    console.log('• Enhanced prompts with better scene understanding');
    console.log('• Character memory system for story continuity');
    console.log('• Consistency scoring and reporting');

  } catch (error) {
    console.error('❌ Error in demonstration:', error);
  }
}

// Mock the functions since we can't actually import the TypeScript
function mockGenerateStoryIllustrationWithConsistency(page, characters, theme, storyContext) {
  const character = characters[0];
  
  const structuredPrompt = `---
character: ${character.name} the ${character.species}
physical_traits: ${character.physicalFeatures}
clothing_accessories: ${character.clothingAccessories || 'none'}
scene_location: Enchanted forest waterfall area
scene_action: ${extractMockAction(page.text, character.name)}
art_style: children's book illustration
quality: high quality, detailed
mood: magical, enchanting
story_context: ${storyContext}
---

Create a children's book illustration of ${character.name} the ${character.species} with ${character.physicalFeatures}. The scene shows ${character.name} ${extractMockAction(page.text, character.name)} in an enchanted forest waterfall area. Style should be magical and enchanting, perfect for a children's storybook.`;

  const dallePrompt = `Create a children's book illustration of ${character.name} the ${character.species} with ${character.physicalFeatures}. The scene shows ${character.name} ${extractMockAction(page.text, character.name)} in an enchanted forest waterfall area. Style should be magical and enchanting, perfect for a children's storybook.

Story Context: ${storyContext}
Page: ${page.number}
Consistency Note: Maintain the same character appearance as established in previous illustrations.

Style: Children's book illustration, magical and enchanting, high quality digital art.`;

  const characterMemory = `You are continuing a story or image involving this consistent character:

Character Profile:
- Name: ${character.name}
- Species: ${character.species}
- Traits:
  - ${character.physicalFeatures}
  - ${character.clothingAccessories || 'No accessories'}

Additional Notes:
- Primary character in ${theme} story

Always match visual and narrative traits. Do not improvise new features.`;

  return Promise.resolve({
    structuredPrompt,
    dallePrompt,
    characterMemory
  });
}

function extractMockAction(text, characterName) {
  if (text.includes('flying')) return 'flying gracefully';
  if (text.includes('drinking')) return 'drinking peacefully';
  if (text.includes('landed')) return 'landing gently';
  if (text.includes('discovered')) return 'discovering with wonder';
  return 'standing peacefully in the scene';
}

class MockStoryCharacterConsistencyManager {
  constructor() {
    this.characterMemories = new Map();
  }

  addCharacterToStory(character, storyContext) {
    const memory = `Character: ${character.name} (${character.species})
Physical traits: ${character.traits.join(', ')}
Consistency notes: ${storyContext}
Remember these details for future illustrations.`;
    this.characterMemories.set(character.name, memory);
    return memory;
  }

  getCharacterConsistencyPrompt(characterName) {
    return this.characterMemories.get(characterName) || '';
  }

  getAllCharacterMemories() {
    return Object.fromEntries(this.characterMemories);
  }

  generateConsistencyReport(pages) {
    return {
      score: 95, // Mock high consistency
      notes: [] // No issues found
    };
  }
}

async function mockEnhanceExistingStoryGeneration(storyJSON, characters, theme) {
  const consistencyManager = new MockStoryCharacterConsistencyManager();
  
  // Add characters to consistency manager
  characters.forEach(char => {
    const utilityChar = {
      name: char.name,
      species: char.species,
      traits: [char.physicalFeatures, char.clothingAccessories].filter(Boolean)
    };
    consistencyManager.addCharacterToStory(utilityChar, `${theme} story: ${storyJSON.title}`);
  });

  // Enhance each page
  const enhancedPages = [];
  for (const page of storyJSON.pages) {
    const promptData = await mockGenerateStoryIllustrationWithConsistency(
      {
        number: page.number,
        text: page.text,
        characterDescriptions: {}
      },
      characters,
      theme,
      storyJSON.title
    );

    enhancedPages.push({
      ...page,
      enhancedIllustrationPrompt: promptData.dallePrompt,
      structuredPrompt: promptData.structuredPrompt,
      characterMemory: promptData.characterMemory
    });
  }

  return {
    enhancedStory: {
      ...storyJSON,
      pages: enhancedPages
    },
    consistencyManager,
    characterMemories: consistencyManager.getAllCharacterMemories()
  };
}

// Override the functions with mocks for this demo
global.generateStoryIllustrationWithConsistency = mockGenerateStoryIllustrationWithConsistency;
global.StoryCharacterConsistencyManager = MockStoryCharacterConsistencyManager;
global.enhanceExistingStoryGeneration = mockEnhanceExistingStoryGeneration;

// Run the demonstration
demonstrateEnhancedPromptGeneration();
