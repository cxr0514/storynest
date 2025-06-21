// Simple browser console script to test child profiles
// Paste this into browser console on localhost:3001

console.log('🔍 Testing child profiles...');

// Check authentication first
fetch('/api/auth/session')
  .then(response => response.json())
  .then(session => {
    console.log('🔐 Session:', session);
    
    if (session?.user) {
      // Now try to fetch child profiles
      return fetch('/api/child-profiles');
    } else {
      console.log('❌ Not authenticated');
      return Promise.reject('Not authenticated');
    }
  })
  .then(response => response.json())
  .then(profiles => {
    console.log('👤 Child Profiles:', profiles);
    if (profiles && profiles.length > 0) {
      profiles.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.name}:`);
        console.log(`   Avatar URL: ${profile.avatarUrl}`);
        console.log(`   Avatar URL Type: ${typeof profile.avatarUrl}`);
        console.log(`   Avatar URL Valid: ${!!profile.avatarUrl}`);
      });
    }
  })
  .catch(error => {
    console.error('❌ Error:', error);
  });
