# Story Generation Error - Post-Authentication Troubleshooting

If you continue to get "Failed to generate story" error AFTER signing in, check these:

## 1. Browser Console Errors
- Press F12 to open Developer Tools
- Go to Console tab
- Look for any red error messages
- Check Network tab for failed API requests

## 2. Form Validation
Ensure you have:
- ✅ Selected a child profile
- ✅ Selected a story theme
- ✅ Selected at least one character
- ✅ All required fields are filled

## 3. OpenAI API Configuration
The error might be related to OpenAI API:
```bash
# Check if OpenAI API key is set
grep OPENAI_API_KEY .env.local
```

## 4. Server Logs
Check the terminal where you started the dev server for error messages.

## 5. Test API Directly (After Sign-in)
Open browser console and run:
```javascript
fetch('/api/auth/session').then(r => r.json()).then(console.log)
```
Should show your user session.

## 6. Database Issues
If signed in but still failing, run:
```bash
node test-authentication-status.js
```

## 7. Clear Browser Data
Sometimes helps to:
- Clear cookies and cache
- Try incognito/private mode
- Restart browser

## Most Common Causes:
1. **Not signed in** (401 error)
2. **Missing OpenAI API key** (500 error)
3. **Form validation failed** (400 error)
4. **Network timeout** (timeout error)

## Quick Test Command:
```bash
# Test if you're authenticated
curl -b cookies.txt http://localhost:3000/api/auth/session
```
