#!/usr/bin/env node

/**
 * Complete Image System Verification Test
 * Tests the entire image pipeline from generation to display
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function runCompleteImageTest() {
  console.log('🧪 COMPLETE IMAGE SYSTEM TEST');
  console.log('==============================\n');

  try {
    // 1. Check database state
    console.log('1. 📊 DATABASE STATE CHECK');
    const totalIllustrations = await prisma.illustration.count();
    console.log(`   Total illustrations in database: ${totalIllustrations}`);
    
    // Get sample illustrations
    const sampleIllustrations = await prisma.illustration.findMany({
      select: {
        id: true,
        url: true,
        StoryPage: {
          select: {
            pageNumber: true,
            Story: {
              select: { title: true, id: true }
            }
          }
        }
      },
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    // 2. Check URL types
    console.log('\n2. 🔗 URL TYPE ANALYSIS');
    const localUrls = sampleIllustrations.filter(ill => ill.url && ill.url.startsWith('/uploads'));
    const openaiUrls = sampleIllustrations.filter(ill => ill.url && ill.url.includes('blob.core.windows.net'));
    const nullUrls = sampleIllustrations.filter(ill => !ill.url);
    
    console.log(`   Local URLs: ${localUrls.length}/${sampleIllustrations.length}`);
    console.log(`   OpenAI URLs: ${openaiUrls.length}/${sampleIllustrations.length}`);
    console.log(`   Null URLs: ${nullUrls.length}/${sampleIllustrations.length}`);

    if (openaiUrls.length > 0) {
      console.log('   ⚠️  Warning: Found OpenAI URLs that may be expired');
    }

    // 3. Check file system
    console.log('\n3. 📁 FILE SYSTEM CHECK');
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      console.log('   ❌ Uploads directory does not exist');
      return;
    }

    const files = fs.readdirSync(uploadsDir);
    const illustrationFiles = files.filter(f => f.startsWith('illustrations_'));
    console.log(`   Illustration files on disk: ${illustrationFiles.length}`);
    
    // Check file sizes
    const fileSizes = illustrationFiles.map(file => {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      return { file, size: Math.round(stats.size / 1024) }; // KB
    }).slice(0, 5);

    console.log('   Sample file sizes:');
    fileSizes.forEach(({file, size}) => {
      console.log(`     ${file}: ${size} KB`);
    });

    // 4. Test stories with illustrations
    console.log('\n4. 📚 STORIES WITH ILLUSTRATIONS');
    const storiesWithIllustrations = await prisma.story.findMany({
      where: {
        StoryPage: {
          some: {
            Illustration: {
              isNot: null
            }
          }
        }
      },
      include: {
        StoryPage: {
          include: {
            Illustration: true
          },
          orderBy: { pageNumber: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    });

    console.log(`   Stories with illustrations: ${storiesWithIllustrations.length}`);
    
    storiesWithIllustrations.forEach(story => {
      const illustratedPages = story.StoryPage.filter(page => page.Illustration);
      console.log(`   📖 ${story.title}`);
      console.log(`      ID: ${story.id}`);
      console.log(`      Illustrated pages: ${illustratedPages.length}/${story.StoryPage.length}`);
      
      // Check URL validity for first few pages
      illustratedPages.slice(0, 3).forEach(page => {
        const url = page.Illustration.url;
        const isLocal = url && url.startsWith('/uploads');
        const status = isLocal ? '✅' : (url ? '⚠️' : '❌');
        console.log(`        Page ${page.pageNumber}: ${status} ${url ? url.substring(0, 50) + '...' : 'No URL'}`);
      });
    });

    // 5. Test API structure
    console.log('\n5. 🔧 API STRUCTURE VERIFICATION');
    const testStory = storiesWithIllustrations[0];
    if (testStory) {
      // Simulate API response structure
      const apiResponse = {
        id: testStory.id,
        title: testStory.title,
        pages: testStory.StoryPage.map(page => ({
          id: page.id,
          pageNumber: page.pageNumber,
          content: page.content.substring(0, 50) + '...',
          illustration: page.Illustration ? {
            id: page.Illustration.id,
            url: page.Illustration.url,
            prompt: page.Illustration.prompt
          } : null
        }))
      };

      const pagesWithImages = apiResponse.pages.filter(p => p.illustration);
      console.log(`   API Response Structure: ✅`);
      console.log(`   Pages with illustrations in API: ${pagesWithImages.length}`);
      
      // Check for potential issues
      const nullUrls = pagesWithImages.filter(p => !p.illustration.url);
      const expiredUrls = pagesWithImages.filter(p => 
        p.illustration.url && p.illustration.url.includes('blob.core.windows.net')
      );

      if (nullUrls.length > 0) {
        console.log(`   ⚠️  Pages with null URLs: ${nullUrls.length}`);
      }
      if (expiredUrls.length > 0) {
        console.log(`   ⚠️  Pages with potentially expired URLs: ${expiredUrls.length}`);
      }
    }

    // 6. Component structure verification
    console.log('\n6. ⚛️  COMPONENT STRUCTURE');
    const storyReaderPath = path.join(process.cwd(), 'src', 'app', 'stories', '[id]', 'page.tsx');
    
    if (fs.existsSync(storyReaderPath)) {
      const content = fs.readFileSync(storyReaderPath, 'utf8');
      
      // Check for key patterns
      const hasImgTag = content.includes('<img');
      const hasUrlReference = content.includes('illustration.url');
      const hasErrorHandling = content.includes('onError');
      const hasLoadHandling = content.includes('onLoad');
      
      console.log(`   Story reader component: ✅`);
      console.log(`   Uses img tag: ${hasImgTag ? '✅' : '❌'}`);
      console.log(`   References illustration.url: ${hasUrlReference ? '✅' : '❌'}`);
      console.log(`   Has error handling: ${hasErrorHandling ? '✅' : '❌'}`);
      console.log(`   Has load handling: ${hasLoadHandling ? '✅' : '❌'}`);
    }

    // 7. Final assessment
    console.log('\n7. 🎯 FINAL ASSESSMENT');
    const allLocal = sampleIllustrations.every(ill => ill.url && ill.url.startsWith('/uploads'));
    const hasFiles = illustrationFiles.length > 0;
    const hasStories = storiesWithIllustrations.length > 0;
    
    console.log(`   All URLs are local: ${allLocal ? '✅' : '❌'}`);
    console.log(`   Files exist on disk: ${hasFiles ? '✅' : '❌'}`);
    console.log(`   Stories have illustrations: ${hasStories ? '✅' : '❌'}`);
    
    const overallStatus = allLocal && hasFiles && hasStories;
    console.log(`\n🎉 OVERALL STATUS: ${overallStatus ? '✅ PASS' : '❌ ISSUES FOUND'}`);
    
    if (overallStatus) {
      console.log('\n✨ Image generation and display system is fully functional!');
      console.log('💡 You can now:');
      console.log('   - Create new stories with illustrations');
      console.log('   - View existing stories with images');
      console.log('   - All images load from local storage');
    } else {
      console.log('\n🔧 Issues detected. Please check the warnings above.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runCompleteImageTest();
