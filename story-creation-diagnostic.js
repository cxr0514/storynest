#!/usr/bin/env node

/**
 * Story Creation Flow Diagnostic Script
 * 
 * This script simulates the exact story creation flow to identify where timeouts occur.
 */

const http = require('http');

console.log('🔍 Story Creation Flow Diagnostic');
console.log('==================================');

// Function to make HTTP requests with timeout handling
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    // Set timeout to 15 seconds to match typical browser timeout
    req.setTimeout(15000, () => {
      console.log(`❌ TIMEOUT: Request to ${options.path} timed out after 15 seconds`);
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.on('error', (e) => {
      console.log(`❌ ERROR: ${e.message}`);
      reject(e);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runDiagnostic() {
  console.log('\n1. Testing basic server response...');
  try {
    const result = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET'
    });
    console.log(`✅ Server responding - Status: ${result.statusCode}`);
  } catch (error) {
    console.log(`❌ Server not responding: ${error.message}`);
    return;
  }

  console.log('\n2. Testing authentication endpoint...');
  try {
    const result = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/session',
      method: 'GET'
    });
    console.log(`✅ Auth endpoint - Status: ${result.statusCode}`);
  } catch (error) {
    console.log(`❌ Auth endpoint timeout: ${error.message}`);
  }

  console.log('\n3. Testing child profiles endpoint...');
  try {
    const result = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/child-profiles',
      method: 'GET'
    });
    console.log(`✅ Child profiles endpoint - Status: ${result.statusCode}`);
  } catch (error) {
    console.log(`❌ Child profiles endpoint timeout: ${error.message}`);
  }

  console.log('\n4. Testing characters endpoint...');
  try {
    const result = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/characters',
      method: 'GET'
    });
    console.log(`✅ Characters endpoint - Status: ${result.statusCode}`);
  } catch (error) {
    console.log(`❌ Characters endpoint timeout: ${error.message}`);
  }

  console.log('\n5. Testing story generation endpoint (this is where SSL timeouts occur)...');
  try {
    const postData = JSON.stringify({
      childProfileId: 1,
      characterId: 1,
      theme: 'adventure',
      moral: 'friendship',
      ageGroup: '5-7'
    });

    const result = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/stories/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, postData);
    
    console.log(`✅ Story generation endpoint - Status: ${result.statusCode}`);
    if (result.statusCode === 401) {
      console.log('   (401 Unauthorized is expected without proper authentication)');
    }
  } catch (error) {
    console.log(`❌ Story generation endpoint TIMEOUT: ${error.message}`);
    console.log('   This is likely the SSL certificate issue!');
  }

  console.log('\n📋 Diagnostic Summary:');
  console.log('If you see timeouts on the story generation endpoint,');
  console.log('the SSL certificate fix may not be properly applied.');
  console.log('\nTo fix SSL certificate issues:');
  console.log('1. Check src/lib/openai.ts contains the SSL fix');
  console.log('2. Restart the development server');
  console.log('3. Clear browser cache');
}

runDiagnostic().catch(console.error);
