# ✅ Vercel Deployment Checklist

Your backend: **https://g2gcrm-backend-3dv1y3u22-navidams-projects.vercel.app/**

## 📋 Pre-Deployment Checklist

### 1. MongoDB Atlas Setup
- [ ] Created FREE MongoDB Atlas account
- [ ] Created cluster (wait 3-5 minutes)
- [ ] Created database user with password
- [ ] Added IP whitelist: `0.0.0.0/0`
- [ ] Got connection string
- [ ] Replaced `<password>` in connection string
- [ ] Tested connection locally

**Connection String Format**:
```
mongodb+srv://username:PASSWORD@cluster.mongodb.net/g2gcrm?retryWrites=true&w=majority
```

### 2. Discord OAuth Setup
- [ ] Created Discord application at https://discord.com/developers/applications
- [ ] Copied Application ID (Client ID)
- [ ] Generated and copied Client Secret
- [ ] Added redirect URL: `http://localhost:3000/auth/discord/callback`
- [ ] Added redirect URL: `https://g2gcrm-backend-3dv1y3u22-navidams-projects.vercel.app/auth/discord/callback`
- [ ] Saved changes in Discord portal

### 3. Session Secret
- [ ] Generated random string with:
  ```powershell
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] Copied the output

### 4. Local Code Changes
- [ ] Switched server files:
  ```bash
  cd backend
  mv server.js server-sqlite-backup.js
  mv server-mongodb.js server.js
  ```
- [ ] Created `backend/.env` with all values
- [ ] Created `frontend/.env` with all values
- [ ] Installed dependencies: `npm install`
- [ ] Tested locally: `npm start`
- [ ] Successfully logged in via Discord locally

### 5. Vercel Environment Variables
Go to: https://vercel.com/dashboard → Backend Project → Settings → Environment Variables

Add these **8 variables**:

- [ ] `MONGODB_URI` = `mongodb+srv://...`
- [ ] `DISCORD_CLIENT_ID` = `your_application_id`
- [ ] `DISCORD_CLIENT_SECRET` = `your_client_secret`
- [ ] `DISCORD_CALLBACK_URL` = `https://g2gcrm-backend-3dv1y3u22-navidams-projects.vercel.app/auth/discord/callback`
- [ ] `SESSION_SECRET` = `your_generated_hex_string`
- [ ] `NODE_ENV` = `production`
- [ ] `CORS_ORIGIN` = `http://localhost:5173` (or your frontend URL)
- [ ] `FRONTEND_URL` = `http://localhost:5173` (or your frontend URL)

### 6. Deploy to Vercel
- [ ] Committed changes: `git add .`
- [ ] Created commit: `git commit -m "Switch to MongoDB"`
- [ ] Pushed to GitHub: `git push`
- [ ] Vercel automatically deploys
- [ ] Wait for deployment to complete

### 7. Verify Deployment
- [ ] Visit: https://g2gcrm-backend-3dv1y3u22-navidams-projects.vercel.app/api/health
- [ ] Check response shows: `"database": "connected"`
- [ ] Visit: https://g2gcrm-backend-3dv1y3u22-navidams-projects.vercel.app/auth/discord
- [ ] Discord login screen appears
- [ ] Can authorize application
- [ ] Redirects successfully

---

## 🎯 Environment Variables Quick Copy

**For Vercel Dashboard** (update with your values):

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/g2gcrm?retryWrites=true&w=majority
DISCORD_CLIENT_ID=123456789012345678
DISCORD_CLIENT_SECRET=your_secret_here
DISCORD_CALLBACK_URL=https://g2gcrm-backend-3dv1y3u22-navidams-projects.vercel.app/auth/discord/callback
SESSION_SECRET=your_random_hex_string_32_characters
NODE_ENV=production
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

---

## 🚨 Common Issues

### ❌ Still getting SQLITE errors

**Solution**: Make sure you switched the server file
```bash
cd backend
ls server*.js
# Should see: server.js, server-sqlite-backup.js, server-mongodb.js
# If server-mongodb.js exists, do:
mv server.js server-sqlite-backup.js
mv server-mongodb.js server.js
git add backend/server.js
git commit -m "Use MongoDB server"
git push
```

### ❌ "Cannot connect to database"

**Check**:
1. MongoDB Atlas cluster is running
2. IP whitelist has `0.0.0.0/0`
3. Database user password is correct
4. Connection string in Vercel matches local .env
5. No extra spaces in environment variables

### ❌ "invalid_redirect_uri"

**Check**:
1. Discord redirect URLs include:
   - `http://localhost:3000/auth/discord/callback`
   - `https://g2gcrm-backend-3dv1y3u22-navidams-projects.vercel.app/auth/discord/callback`
2. Both URLs saved in Discord portal
3. No typos in URLs

### ❌ 500 Error on all requests

**Check**:
1. All 8 environment variables in Vercel
2. No typos in variable names
3. SESSION_SECRET is set
4. Re-deploy after adding variables

---

## 📊 Deployment Status

Check these URLs:

| Endpoint | Expected Result |
|----------|----------------|
| https://g2gcrm-backend-3dv1y3u22-navidams-projects.vercel.app/api/health | `{"status":"ok","database":"connected"}` |
| https://g2gcrm-backend-3dv1y3u22-navidams-projects.vercel.app/auth/discord | Redirects to Discord |
| https://g2gcrm-backend-3dv1y3u22-navidams-projects.vercel.app/auth/status | `{"authenticated":false}` |

---

## ✅ Success!

Your deployment is successful when:
- ✅ Health check shows database connected
- ✅ Can login via Discord OAuth
- ✅ No SQLITE_CANTOPEN errors
- ✅ API endpoints respond (after login)

---

## 🚀 Next Steps After Deployment

1. **Test Authentication**
   - Login via Discord
   - Check session persists

2. **Configure G2G API**
   - Use Settings page in dashboard
   - Add G2G API key
   - Test connection

3. **Start Using Dashboard**
   - Fetch orders
   - Manage offers
   - Upload inventory

---

## 📞 Quick Links

- **Your Backend**: https://g2gcrm-backend-3dv1y3u22-navidams-projects.vercel.app/
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Discord Developer**: https://discord.com/developers/applications
- **Vercel Dashboard**: https://vercel.com/dashboard

---

**Current Status**: Backend deployed, needs environment variables ✅

**Next Step**: Add MongoDB & Discord credentials to Vercel 🔐

