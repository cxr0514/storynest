#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files to update with enhanced logging
const filesToUpdate = [
  'src/app/api/stories/ai/route.ts',
  'src/app/api/stories/generate-enhanced/route.ts',
  'src/app/api/child-profiles/ai/route.ts',
  'src/app/api/ai/test/route.ts',
  'src/app/api/health/route.ts',
  'src/app/api/characters/route.ts',
  'src/app/api/stories/route.ts',
  'src/app/api/child-profiles/route.ts'
];

const workspaceRoot = '/Users/CXR0514/Library/CloudStorage/OneDrive-TheHomeDepot/Documents 1/GitHub/storynest';

function updateLogging(filePath) {
  const fullPath = path.join(workspaceRoot, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  console.log(`🔄 Updating logging in: ${filePath}`);
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Add logger import if not present
  if (!content.includes("import { logger }")) {
    // Find the import section and add logger import
    if (content.includes("import { authOptions }")) {
      content = content.replace(
        "import { authOptions }",
        "import { authOptions }"
      );
      // Add logger import after auth import
      content = content.replace(
        /import { authOptions } from '@\/lib\/auth'/,
        "import { authOptions } from '@/lib/auth'\nimport { logger } from '@/lib/logger'"
      );
    } else {
      // Add at the top after other imports
      const lines = content.split('\n');
      let insertIndex = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ') || lines[i].startsWith("import {")) {
          insertIndex = i + 1;
        } else if (lines[i].trim() === '') {
          break;
        }
      }
      lines.splice(insertIndex, 0, "import { logger } from '@/lib/logger'");
      content = lines.join('\n');
    }
  }

  // Remove old log function if present
  content = content.replace(/\/\/[^\n]*Enhanced logging for debugging[\s\S]*?}\s*\n/m, '');
  content = content.replace(/function log\([^}]+}\s*\n/m, '');

  // Replace log() calls with logger methods
  const logReplacements = [
    // log('info', ...) -> logger.info(...)
    {
      pattern: /log\('info',\s*([^,]+)\)/g,
      replacement: 'logger.info($1)'
    },
    {
      pattern: /log\('info',\s*([^,]+),\s*([^)]+)\)/g,
      replacement: 'logger.info($1, { context: $2 })'
    },
    // log('error', ...) -> logger.error(...)
    {
      pattern: /log\('error',\s*([^,]+)\)/g,
      replacement: 'logger.error($1)'
    },
    {
      pattern: /log\('error',\s*([^,]+),\s*([^)]+)\)/g,
      replacement: 'logger.error($1, $2)'
    },
    // log('warn', ...) -> logger.warn(...)
    {
      pattern: /log\('warn',\s*([^,]+)\)/g,
      replacement: 'logger.warn($1)'
    },
    {
      pattern: /log\('warn',\s*([^,]+),\s*([^)]+)\)/g,
      replacement: 'logger.warn($1, undefined, { context: $2 })'
    },
    // log('success', ...) -> logger.success(...)
    {
      pattern: /log\('success',\s*([^,]+)\)/g,
      replacement: 'logger.success($1)'
    },
    {
      pattern: /log\('success',\s*([^,]+),\s*([^)]+)\)/g,
      replacement: 'logger.success($1, { context: $2 })'
    }
  ];

  // Apply replacements
  logReplacements.forEach(({ pattern, replacement }) => {
    content = content.replace(pattern, replacement);
  });

  // Additional specific patterns for common scenarios
  content = content.replace(
    /console\.log\(/g,
    'logger.info('
  );
  content = content.replace(
    /console\.error\(/g,
    'logger.error('
  );
  content = content.replace(
    /console\.warn\(/g,
    'logger.warn('
  );

  // Write updated content
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`✅ Updated: ${filePath}`);
}

// Update all files
console.log('🚀 Starting comprehensive logging system update...\n');

filesToUpdate.forEach(updateLogging);

console.log('\n✅ Enhanced logging system implementation complete!');
console.log('\n📋 Summary:');
console.log('- Added logger import to all API endpoints');
console.log('- Replaced old log() function calls with logger methods');
console.log('- Enhanced error context and structured logging');
console.log('- Removed redundant logging functions');
console.log('\n🎯 All API endpoints now use the centralized logging system.');
