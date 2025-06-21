// COPY AND PASTE THIS INTO YOUR BROWSER CONSOLE (F12)
// This will clear all OAuth-related cookies and storage

console.log('🧹 Clearing OAuth cookies and storage...');

// Clear all cookies for this domain
document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

// Clear localStorage
try {
    localStorage.clear();
    console.log('✅ localStorage cleared');
} catch (e) {
    console.log('⚠️ localStorage already empty');
}

// Clear sessionStorage  
try {
    sessionStorage.clear();
    console.log('✅ sessionStorage cleared');
} catch (e) {
    console.log('⚠️ sessionStorage already empty');
}

// Clear IndexedDB (if any)
if ('indexedDB' in window) {
    indexedDB.databases().then(databases => {
        databases.forEach(db => {
            indexedDB.deleteDatabase(db.name);
        });
    }).catch(() => console.log('IndexedDB not accessible'));
}

console.log('✅ All browser storage cleared!');
console.log('🔄 Refreshing page in 2 seconds...');

// Automatically refresh after 2 seconds
setTimeout(() => {
    window.location.href = 'http://localhost:3000/api/auth/signin';
}, 2000);
