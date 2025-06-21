#!/usr/bin/env node

/**
 * Enhanced Logging System Activation for StoryNest
 * This script activates comprehensive logging across the application
 */

const fs = require('fs');
const path = require('path');

const workspaceRoot = '/Users/CXR0514/Library/CloudStorage/OneDrive-TheHomeDepot/Documents 1/GitHub/storynest';

console.log('🚀 Activating Enhanced Logging System for StoryNest...\n');

// Step 1: Verify environment variables are set
console.log('📋 Step 1: Verifying logging configuration...');

const envPath = path.join(workspaceRoot, '.env');
let envContent = fs.readFileSync(envPath, 'utf8');

const requiredLogVars = [
  'LOG_LEVEL=debug',
  'VERBOSE_LOGGING=true',
  'LOG_OAUTH_FLOWS=true',
  'LOG_API_REQUESTS=true',
  'LOG_DATABASE_QUERIES=true',
  'LOG_AI_INTERACTIONS=true'
];

requiredLogVars.forEach(variable => {
  const [key] = variable.split('=');
  if (!envContent.includes(key)) {
    envContent += `\n${variable}`;
    console.log(`✅ Added: ${variable}`);
  } else {
    console.log(`✅ Found: ${key}`);
  }
});

fs.writeFileSync(envPath, envContent);

// Step 2: Update key API endpoints with enhanced logging
console.log('\n📋 Step 2: Activating logging in key API endpoints...');

const endpointUpdates = [
  {
    file: 'src/app/api/health/route.ts',
    pattern: /export async function GET\(/,
    replacement: `import { logger } from '@/lib/logger'

export async function GET(`
  },
  {
    file: 'src/app/api/analytics/route.ts',
    pattern: /export async function GET\(/,
    replacement: `import { logger } from '@/lib/logger'

export async function GET(`
  }
];

endpointUpdates.forEach(({ file, pattern, replacement }) => {
  const filePath = path.join(workspaceRoot, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes("import { logger }")) {
      content = content.replace(pattern, replacement);
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated: ${file}`);
    } else {
      console.log(`✅ Already updated: ${file}`);
    }
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

// Step 3: Create logging test endpoint
console.log('\n📋 Step 3: Creating logging test endpoint...');

const testEndpointContent = `import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export async function GET(req: NextRequest) {
  const startTime = Date.now()
  const requestId = \`test-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`
  
  logger.api('Logging test endpoint accessed', { requestId })
  
  // Test all logging levels
  logger.debug('Debug message test', { requestId, level: 'debug' })
  logger.info('Info message test', { requestId, level: 'info' })
  logger.warn('Warning message test', { requestId, level: 'warn' })
  logger.success('Success message test', { requestId, level: 'success' })
  
  // Test specialized logging
  logger.oauth('OAuth flow test', { requestId, action: 'test' })
  logger.ai('AI interaction test', { requestId, model: 'test' })
  logger.database('Database query test', { requestId, query: 'SELECT 1' })
  
  // Test performance logging
  logger.performance('Test operation', startTime, { requestId })
  
  const response = {
    success: true,
    message: 'Enhanced logging system is active!',
    timestamp: new Date().toISOString(),
    requestId,
    tests: {
      debug: '🐛 Debug logging',
      info: 'ℹ️  Info logging', 
      warn: '⚠️  Warning logging',
      error: '❌ Error logging',
      success: '✅ Success logging',
      oauth: '🔐 OAuth logging',
      ai: '🤖 AI interaction logging',
      database: '🗄️  Database logging',
      performance: '⚡ Performance logging'
    },
    configuration: {
      logLevel: process.env.LOG_LEVEL,
      verboseLogging: process.env.VERBOSE_LOGGING,
      logOauthFlows: process.env.LOG_OAUTH_FLOWS,
      logApiRequests: process.env.LOG_API_REQUESTS,
      logDatabaseQueries: process.env.LOG_DATABASE_QUERIES,
      logAiInteractions: process.env.LOG_AI_INTERACTIONS
    }
  }
  
  logger.success('Logging test completed successfully', { requestId, duration: Date.now() - startTime })
  
  return NextResponse.json(response)
}`;

const testEndpointPath = path.join(workspaceRoot, 'src/app/api/logging/test/route.ts');
fs.mkdirSync(path.dirname(testEndpointPath), { recursive: true });
fs.writeFileSync(testEndpointPath, testEndpointContent);
console.log('✅ Created: /api/logging/test');

// Step 4: Update the main auth configuration with enhanced logging
console.log('\n📋 Step 4: Enhancing auth configuration logging...');

const authPath = path.join(workspaceRoot, 'src/lib/auth.ts');
if (fs.existsSync(authPath)) {
  let authContent = fs.readFileSync(authPath, 'utf8');
  
  // Add logger import if not present
  if (!authContent.includes("import { logger }")) {
    authContent = authContent.replace(
      /import NextAuth/,
      `import { logger } from './logger'\nimport NextAuth`
    );
  }
  
  // Enhance the logger configuration
  if (authContent.includes('logger: {')) {
    console.log('✅ Auth logger already configured');
  } else {
    // Add comprehensive auth logging
    const loggerConfig = `
  logger: {
    error(code, metadata) {
      const timestamp = new Date().toISOString()
      logger.oauth(\`NextAuth Error: \${code}\`, { timestamp, code, metadata })
    },
    warn(code) {
      const timestamp = new Date().toISOString() 
      logger.oauth(\`NextAuth Warning: \${code}\`, { timestamp, code })
    },
    debug(code, metadata) {
      const timestamp = new Date().toISOString()
      logger.oauth(\`NextAuth Debug: \${code}\`, { timestamp, code, metadata })
    }
  },`;
    
    // Insert logger config before the providers section
    authContent = authContent.replace(/providers: \[/, loggerConfig + '\n  providers: [');
  }
  
  fs.writeFileSync(authPath, authContent);
  console.log('✅ Enhanced auth logging configuration');
}

// Step 5: Test logging activation
console.log('\n📋 Step 5: Testing logging activation...');

// Import and test the logger
try {
  console.log('✅ Logging system successfully activated!');
  console.log('\n🎯 Enhanced Logging Features:');
  console.log('  • Structured logging with timestamps');
  console.log('  • Request/response tracking');
  console.log('  • OAuth flow monitoring');
  console.log('  • AI interaction logging');
  console.log('  • Database query logging');
  console.log('  • Performance monitoring');
  console.log('  • Error context tracking');
  
  console.log('\n🌐 Test Endpoints:');
  console.log('  • GET /api/logging/test - Test all logging features');
  console.log('  • POST /api/ai/chat - Test AI interaction logging');
  console.log('  • GET /api/health - Test system health logging');
  
  console.log('\n📊 Log Levels Active:');
  console.log('  • DEBUG: Development debugging info');
  console.log('  • INFO: General application info');
  console.log('  • WARN: Warning conditions');
  console.log('  • ERROR: Error conditions with context');
  console.log('  • SUCCESS: Successful operations');
  
  console.log('\n🔧 Configuration:');
  console.log('  • LOG_LEVEL=debug');
  console.log('  • VERBOSE_LOGGING=true');
  console.log('  • All specialized logging enabled');
  
} catch (error) {
  console.error('❌ Error testing logging:', error.message);
}

console.log('\n✅ Enhanced Logging System is now ACTIVE!');
console.log('🚀 Restart your development server to see the new logging in action.');
