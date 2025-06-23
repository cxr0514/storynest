import { generateIllustrationPrompt, cleanForClaude } from './lib/ai-prompt-utils.js';

// Test the AI prompt utilities with Luna dragon
console.log('🐉 Testing Luna Dragon AI Prompt Generation...\n');

try {
  // Luna character configuration
  const lunaCharacter = {
    name: 'Luna',
    species: 'Dragon',
    traits: ['purple scales', 'silver belly', 'glowing green eyes', 'tiny wings']
  };
  
  const lunaScene = {
    location: 'Behind the waterfall in the Enchanted Forest',
    action: 'Luna flies up toward glowing cave runes'
  };
  
  // Generate the illustration prompt
  const prompt = generateIllustrationPrompt(lunaCharacter, lunaScene);
  console.log('✅ Generated Illustration Prompt:');
  console.log('📝 Raw prompt:', prompt);
  
  // Clean the prompt for Claude (as our API does)
  const cleanedPrompt = cleanForClaude(prompt);
  console.log('\n✅ Cleaned Prompt for DALL-E:');
  console.log('🧹 Cleaned prompt:', cleanedPrompt);
  
  console.log('\n🎯 Luna Character Details:');
  console.log('• Name:', lunaCharacter.name);
  console.log('• Species:', lunaCharacter.species);
  console.log('• Traits:', lunaCharacter.traits.join(', '));
  console.log('• Scene:', lunaScene.action);
  console.log('• Location:', lunaScene.location);
  
  console.log('\n🚀 AI Prompt Utilities Test: SUCCESSFUL');
  console.log('Ready for DALL-E 3 image generation!');
  
} catch (error) {
  console.error('❌ AI Prompt Utilities Test Failed:', error);
}
