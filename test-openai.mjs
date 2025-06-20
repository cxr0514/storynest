/**
 * Test OpenAI API connectivity and image generation
 */

import { generateIllustration } from './src/lib/openai.js';

async function testOpenAI() {
  console.log('🧪 Testing OpenAI Image Generation');
  console.log('==================================\n');

  try {
    // Test simple image generation
    console.log('📸 Generating test image...');
    const testPrompt = "A friendly cartoon bunny sitting in a colorful meadow";
    
    const imageUrl = await generateIllustration(testPrompt);
    
    if (imageUrl) {
      console.log('✅ SUCCESS: Image generated!');
      console.log('🖼️  Image URL:', imageUrl);
      return true;
    } else {
      console.log('❌ FAILED: No image URL returned');
      return false;
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    return false;
  }
}

testOpenAI().then(success => {
  console.log('\n📊 Result:', success ? 'WORKING ✅' : 'FAILED ❌');
  process.exit(success ? 0 : 1);
});
