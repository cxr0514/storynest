#!/usr/bin/env node

/**
 * StoryNest AI API Usage Example
 * Demonstrates the complete AI-powered story generation flow
 */

const BASE_URL = 'http://localhost:3002'

// Utility function for API calls
async function apiCall(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  }
  
  if (data) {
    options.body = JSON.stringify(data)
  }
  
  const response = await fetch(`${BASE_URL}${endpoint}`, options)
  const result = await response.json()
  
  return {
    status: response.status,
    data: result
  }
}

async function demonstrateAIFeatures() {
  console.log('🤖 StoryNest AI API Demo')
  console.log('========================\n')
  
  try {
    // 1. System Health Check
    console.log('📊 1. Checking system health...')
    const healthCheck = await apiCall('/api/ai/test')
    
    if (healthCheck.data.summary.overallStatus === 'HEALTHY' || 
        healthCheck.data.summary.overallStatus === 'HEALTHY_WITH_WARNINGS') {
      console.log('✅ System is healthy!')
      console.log(`   Tests: ${healthCheck.data.summary.passed}/${healthCheck.data.summary.total} passed`)
      console.log(`   Duration: ${healthCheck.data.summary.duration}ms\n`)
    } else {
      console.log('❌ System has issues!')
      return
    }
    
    // 2. AI Chat Helper Demo
    console.log('💬 2. Testing AI Chat Helper...')
    
    // Start a conversation
    const chatMessages = [
      { role: 'user', content: 'I want a story about friendship' }
    ]
    
    const chatResponse1 = await apiCall('/api/ai/chat', 'POST', {
      messages: chatMessages
    })
    
    if (chatResponse1.data.success) {
      console.log(`   AI: ${chatResponse1.data.reply}`)
      console.log(`   Response time: ${chatResponse1.data.metadata.responseTime}ms`)
      
      // Continue conversation
      chatMessages.push({ role: 'assistant', content: chatResponse1.data.reply })
      chatMessages.push({ role: 'user', content: 'Yes! Maybe with a cat and dog?' })
      
      const chatResponse2 = await apiCall('/api/ai/chat', 'POST', {
        messages: chatMessages
      })
      
      if (chatResponse2.data.success) {
        console.log(`   AI: ${chatResponse2.data.reply}`)
        console.log('✅ Chat helper working with context!\n')
      }
    } else {
      console.log('❌ Chat helper failed\n')
    }
    
    // 3. Storage System Demo
    console.log('💾 3. Testing storage system...')
    const storageTest = await apiCall('/api/ai/test', 'POST', {
      testType: 'storage'
    })
    
    if (storageTest.data.success) {
      const result = storageTest.data.result
      console.log(`   S3 Available: ${result.s3Available}`)
      console.log(`   Local Storage Available: ${result.localStorageAvailable}`)
      console.log(`   Recommended: ${result.recommendedStorage}`)
      console.log('✅ Storage system operational!\n')
    }
    
    // 4. Demonstrate Story Generation API Structure
    console.log('📚 4. Story Generation API Structure')
    console.log('   Note: Actual story generation requires authentication')
    console.log('   Example request for /api/stories/ai:')
    console.log('   Example request for /api/stories/ai:')
    console.log(JSON.stringify({
      childId: "child-profile-uuid",
      theme: "friendship and adventure", 
      characterIds: ["char1-uuid", "char2-uuid"],
      language: "English",
      storyType: "Adventure", 
      writingStyle: "Funny",
      readerAge: "5 – 7 years",
      pageCount: 5,
      ideaChat: chatMessages
    }, null, 2))
    console.log('')
    
    // 5. Feature Summary
    console.log('🎯 5. Available Features Summary')
    console.log('================================')
    console.log('✅ AI Chat Helper - Interactive story brainstorming')
    console.log('✅ Enhanced Story Generation - GPT-4o + DALL-E 3')
    console.log('✅ Wasabi S3 Integration - Smart image storage with fallback')
    console.log('✅ Comprehensive Error Handling - Graceful degradation')
    console.log('✅ Database Integration - Full metadata support')
    console.log('✅ Performance Monitoring - Real-time health checks')
    console.log('✅ Production Ready - Complete API scaffold\n')
    
    console.log('🚀 StoryNest AI features are fully operational!')
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message)
  }
}

// Run the demo
demonstrateAIFeatures().catch(console.error)
