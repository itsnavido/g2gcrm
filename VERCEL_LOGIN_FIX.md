# Fix: Login Loop on Vercel

## The Problem

When deploying to Vercel with separate frontend and backend domains, you may experience a login loop where:
1. You login via Discord successfully
2. Get redirected to frontend
3. Frontend can't read the session cookie
4. You get redirected back to login page
5. Infinite loop

## Why This Happens

Vercel deployments use separate domains for frontend and backend (e.g., `frontend.vercel.app` and `backend.vercel.app`). For session cookies to work across different domains, they need:

1. **HTTPS** - Required for secure cookies
2. **SameSite=None** - Allows cross-domain cookies
3. **Credentials** - Both frontend and backend must support credentials
4. **Correct CORS configuration**

## Solution: Deploy on Same Domain (Recommended)

The **best solution** is to deploy both frontend and backend under the same domain using Vercel's rewrite feature:

### Option 1: Frontend Proxies Backend (Easiest)

Deploy everything through the frontend project:

1. **In your frontend project root**, create `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend.vercel.app/api/:path*"
    },
    {
      "source": "/auth/:path*",
      "destination": "https://your-backend.vercel.app/auth/:path*"
    }
  ]
}
```

2. **Update Frontend Environment Variables** in Vercel:
```env
VITE_API_URL=https://your-frontend.vercel.app
```

3. **Update Backend Environment Variables** in Vercel:
```env
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
CORS_ORIGIN=https://your-frontend.vercel.app
# Do NOT set COOKIE_DOMAIN
```

This makes the frontend proxy all `/api/*` and `/auth/*` requests to the backend, so cookies work on the same domain.

---

### Option 2: Use Custom Domain

If you have a custom domain:

1. **Set up custom domain** in Vercel:
   - Frontend: `app.yourdomain.com`
   - Backend: `api.yourdomain.com`

2. **Update Backend Environment Variables**:
```env
NODE_ENV=production
FRONTEND_URL=https://app.yourdomain.com
CORS_ORIGIN=https://app.yourdomain.com
COOKIE_DOMAIN=.yourdomain.com
```

3. **Update Frontend Environment Variables**:
```env
VITE_API_URL=https://api.yourdomain.com
```

The `COOKIE_DOMAIN=.yourdomain.com` (note the leading dot) allows cookies to work across subdomains.

---

### Option 3: Separate Domains (Not Recommended)

If you must use separate Vercel domains (`frontend.vercel.app` and `backend.vercel.app`), cross-domain cookies are very unreliable and may not work in many browsers due to privacy features.

**This approach has limitations:**
- Safari blocks third-party cookies by default
- Chrome is phasing out third-party cookies
- Many browsers with privacy extensions will block these cookies

If you still want to try:

1. **Update Backend Environment Variables**:
```env
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
CORS_ORIGIN=https://your-frontend.vercel.app
# Leave COOKIE_DOMAIN empty
```

2. **Update Frontend Environment Variables**:
```env
VITE_API_URL=https://your-backend.vercel.app
```

3. **Test in multiple browsers** - it may not work in all browsers

---

## Verifying the Fix

1. **Deploy both frontend and backend** with the new configuration
2. **Clear browser cache and cookies**
3. **Open developer tools** (F12) → Application/Storage → Cookies
4. **Login via Discord**
5. **Check that session cookie appears** in cookies
6. **Refresh the page** - you should stay logged in

---

## Troubleshooting

### Still in login loop?

1. **Check CORS_ORIGIN matches exactly**:
   ```bash
   # In Vercel, check backend environment variables
   CORS_ORIGIN should match your frontend URL exactly
   ```

2. **Check browser console for errors**:
   - Open DevTools → Console
   - Look for CORS errors or cookie warnings

3. **Verify credentials are set**:
   - Backend: `credentials: true` in CORS config ✅ (already set)
   - Frontend: `withCredentials: true` in axios calls ✅ (already set)

4. **Check Discord redirect URL**:
   - Go to Discord Developer Portal
   - OAuth2 → General → Redirects
   - Should be: `https://your-backend.vercel.app/auth/discord/callback`
   - OR if using proxy: `https://your-frontend.vercel.app/auth/discord/callback`

### Cookie not appearing?

1. **Check browser privacy settings**:
   - Disable "Block third-party cookies"
   - Disable privacy extensions temporarily for testing

2. **Check cookie settings in backend**:
   - Should have `secure: true` in production
   - Should have `sameSite: 'none'` in production
   - Both are already configured ✅

3. **Verify HTTPS**:
   - Both domains must use HTTPS (Vercel does this automatically)

---

## Recommended Deployment Strategy

**Best Practice**: Use Option 1 (Frontend Proxies Backend)

This is the simplest and most reliable approach:
- ✅ Works in all browsers
- ✅ No cookie domain issues
- ✅ No CORS complexity
- ✅ Better security (no credentials in OPTIONS requests)
- ✅ Easier to manage

The slight downside is that requests go through an extra hop (frontend → backend), but for a CRM dashboard with low traffic, this is negligible.

---

## Need Help?

1. Check Vercel deployment logs for errors
2. Check browser console for CORS/cookie errors
3. Verify all environment variables are set correctly
4. Make sure Discord redirect URL matches your deployment

**Remember**: After changing environment variables in Vercel, you must redeploy for changes to take effect!

