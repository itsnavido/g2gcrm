# Quick Fix for Vercel Login Loop

## Step-by-Step Instructions

### 1. Update Frontend Environment Variables in Vercel

Go to: https://vercel.com/dashboard → `g2gcrm-frontend` → Settings → Environment Variables

Set:
```
VITE_API_URL=https://g2gcrm-frontend.vercel.app
VITE_DISCORD_CLIENT_ID=your_discord_client_id
```

**Important**: The API URL now points to the FRONTEND itself (it will proxy to backend)

### 2. Update Backend Environment Variables in Vercel

Go to: https://vercel.com/dashboard → `g2gcrm-backend` → Settings → Environment Variables

Verify these are set correctly:
```
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_secret
DISCORD_CALLBACK_URL=https://g2gcrm-backend.vercel.app/auth/discord/callback
SESSION_SECRET=your_session_secret
CORS_ORIGIN=https://g2gcrm-frontend.vercel.app
FRONTEND_URL=https://g2gcrm-frontend.vercel.app
```

### 3. Update Discord Developer Portal

Go to: https://discord.com/developers/applications

1. Select your application
2. Go to **OAuth2** → **General** → **Redirects**
3. Make sure you have:
   ```
   https://g2gcrm-backend.vercel.app/auth/discord/callback
   ```

### 4. Redeploy Both Projects

The `vercel.json` has been added to the frontend project. Now commit and push:

```bash
git add .
git commit -m "Add Vercel proxy configuration for auth"
git push
```

Vercel will automatically redeploy both frontend and backend.

### 5. Test the Login

1. Clear your browser cache and cookies
2. Go to: https://g2gcrm-frontend.vercel.app
3. Click "Login with Discord"
4. You should be redirected through Discord and back to the dashboard

## How It Works Now

```
Frontend (g2gcrm-frontend.vercel.app)
    ↓ User clicks login
    ↓ Requests /auth/discord
    ↓ (Vercel proxy rewrites to backend)
    ↓
Backend (g2gcrm-backend.vercel.app)
    ↓ Redirects to Discord
    ↓
Discord
    ↓ User authorizes
    ↓ Redirects to /auth/discord/callback
    ↓
Backend
    ↓ Creates session cookie
    ↓ Redirects to frontend
    ↓
Frontend (g2gcrm-frontend.vercel.app)
    ✓ Cookie works! (same domain)
    ✓ User logged in
```

## Troubleshooting

### Still getting 404 on /auth/discord?

1. Make sure you pushed the changes (vercel.json should be in frontend)
2. Wait for Vercel to finish deploying
3. Check deployment logs in Vercel dashboard

### Still in login loop?

1. Clear browser cookies completely
2. Check browser console for errors
3. Verify all environment variables are set correctly
4. Make sure Discord redirect URL is set to backend URL
5. Try in incognito/private window

### Backend not receiving requests?

1. Check Vercel logs for backend deployment
2. Make sure MongoDB is connected
3. Test backend directly: https://g2gcrm-backend.vercel.app/api/health

## Summary

✅ Created `frontend/vercel.json` - proxies auth/api requests to backend
✅ Frontend points to itself in VITE_API_URL
✅ Backend CORS allows frontend domain
✅ Session cookies work (same domain via proxy)

This is the recommended approach for Vercel deployments!

