/**
 * Simple test to verify story metadata fields are working in the database
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testMetadataFields() {
  console.log('🧪 Testing story metadata fields...')
  
  try {
    // Check if we can create a story with the new metadata fields
    const testData = {
      id: 'test-story-' + Date.now(),
      title: 'Test Story with Metadata',
      theme: 'Adventure',
      summary: 'A test story to verify metadata fields',
      userId: 'test-user-id',
      childProfileId: 'test-child-id',
      language: 'Spanish',
      category: 'Adventure', 
      writingStyle: 'Funny',
      readerAge: '7 – 9 years'
    }

    console.log('📝 Attempting to create story with metadata...')
    
    // Use raw query to bypass TypeScript issues
    const result = await prisma.$executeRaw`
      INSERT INTO "Story" (
        id, title, theme, summary, "userId", "childProfileId", 
        language, category, "writingStyle", "readerAge"
      ) VALUES (
        ${testData.id}, ${testData.title}, ${testData.theme}, 
        ${testData.summary}, ${testData.userId}, ${testData.childProfileId},
        ${testData.language}::"StoryLanguage", 
        ${testData.category}::"StoryCategory",
        ${testData.writingStyle}::"StoryWritingStyle",
        ${testData.readerAge}
      )
    `
    
    console.log('✅ Story created successfully:', result)
    
    // Query it back to verify
    const story = await prisma.$queryRaw`
      SELECT id, title, language, category, "writingStyle", "readerAge" 
      FROM "Story" 
      WHERE id = ${testData.id}
    `
    
    console.log('✅ Story retrieved with metadata:', story)
    
    // Cleanup
    await prisma.$executeRaw`DELETE FROM "Story" WHERE id = ${testData.id}`
    console.log('✅ Test story cleaned up')
    
    console.log('\n🎉 Metadata fields are working correctly in the database!')
    return true
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testMetadataFields().then(success => {
  process.exit(success ? 0 : 1)
})
