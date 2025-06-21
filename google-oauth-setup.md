# Google OAuth Setup Fix

## Issue
```
Error 400: redirect_uri_mismatch
```

## Solution
You need to add the correct redirect URI to your Google Cloud Console OAuth configuration.

## Steps to Fix:

### 1. Go to Google Cloud Console
- Open: https://console.cloud.google.com/
- Select your project (or the project where your OAuth app is configured)

### 2. Navigate to OAuth Credentials
- Go to: **APIs & Services** → **Credentials**
- Find your OAuth 2.0 Client ID: `220199238608-goe6jc7vo491ols46o7acjgqm4gsnd84.apps.googleusercontent.com`

### 3. Edit the OAuth Client
- Click on the OAuth client ID
- In the **Authorized redirect URIs** section, add this URI:
  ```
  http://localhost:3000/api/auth/callback/google
  ```

### 4. Save Changes
- Click **Save**
- Wait a few minutes for changes to propagate

## Current Configuration
- **Client ID**: `220199238608-goe6jc7vo491ols46o7acjgqm4gsnd84.apps.googleusercontent.com`
- **NEXTAUTH_URL**: `http://localhost:3000`
- **Expected Redirect URI**: `http://localhost:3000/api/auth/callback/google`

## Alternative Quick Fix (For Development)
If you want to test immediately, you can also add these common development URIs:
```
http://localhost:3000/api/auth/callback/google
http://localhost:3001/api/auth/callback/google
http://127.0.0.1:3000/api/auth/callback/google
```

## Verification
After making the changes, test the OAuth flow again at:
http://localhost:3000/auth/signin
