# 🚀 Setup Guide for g2gcrm-backend-3dv1y3u22-navidams-projects.vercel.app

**Your Backend**: https://g2gcrm-backend-3dv1y3u22-navidams-projects.vercel.app/

## ⚡ Quick Setup (10 Minutes)

### 1️⃣ MongoDB Atlas (FREE - 2 min)

1. https://www.mongodb.com/cloud/atlas/register
2. Create FREE cluster → Wait 3 minutes  
3. Database Access → Add User → Password auth
4. Network Access → Add IP → `0.0.0.0/0`
5. Connect → Drivers → Copy connection string
6. Add `/g2gcrm` before `?`:
   ```
   mongodb+srv://user:pass@cluster.mongodb.net/g2gcrm?retryWrites=true
   ```

### 2️⃣ Discord OAuth (3 min)

1. https://discord.com/developers/applications
2. New Application → "G2G CRM"
3. Copy **Application ID**
4. OAuth2 → Reset Secret → Copy **Client Secret**
5. Add Redirects:
   ```
   http://localhost:3000/auth/discord/callback
   https://g2gcrm-backend-3dv1y3u22-navidams-projects.vercel.app/auth/discord/callback
   ```
6. **Save Changes**

### 3️⃣ Vercel Environment Variables (2 min)

Vercel Dashboard → Backend Project → Settings → Environment Variables

Add these **8 variables**:

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/g2gcrm?retryWrites=true&w=majority
DISCORD_CLIENT_ID=your_app_id_from_step2
DISCORD_CLIENT_SECRET=your_secret_from_step2
DISCORD_CALLBACK_URL=https://g2gcrm-backend-3dv1y3u22-navidams-projects.vercel.app/auth/discord/callback
SESSION_SECRET=run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
NODE_ENV=production
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

### 4️⃣ Switch to MongoDB (1 min)

```powershell
cd backend
mv server.js server-sqlite.js
mv server-mongodb.js server.js
```

### 5️⃣ Create Local .env Files

**backend/.env**:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/g2gcrm
DISCORD_CLIENT_ID=your_app_id
DISCORD_CLIENT_SECRET=your_secret
DISCORD_CALLBACK_URL=http://localhost:3000/auth/discord/callback
SESSION_SECRET=your_generated_hex
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

**frontend/.env**:
```env
VITE_API_URL=http://localhost:3000
VITE_DISCORD_CLIENT_ID=your_app_id
```

### 6️⃣ Deploy (1 min)

```powershell
git add .
git commit -m "Switch to MongoDB"
git push
```

Vercel auto-deploys! ✅

---

## ✅ Verify It Works

**Test Backend**:
```
https://g2gcrm-backend-3dv1y3u22-navidams-projects.vercel.app/api/health
```
Should show: `"database": "connected"` ✅

**Test Login**:
```
https://g2gcrm-backend-3dv1y3u22-navidams-projects.vercel.app/auth/discord
```
Should redirect to Discord ✅

---

## 📱 Deploy Frontend (Optional)

1. Vercel → New Project → Import GitHub Repo
2. Root Directory: `frontend`
3. Framework: Vite
4. Environment Variables:
   ```
   VITE_API_URL=https://g2gcrm-backend-3dv1y3u22-navidams-projects.vercel.app
   VITE_DISCORD_CLIENT_ID=your_app_id
   ```
5. Deploy!

Then update backend environment variables:
```
CORS_ORIGIN=https://your-frontend.vercel.app
FRONTEND_URL=https://your-frontend.vercel.app
```

---

## 🆘 Troubleshooting

**"SQLITE_CANTOPEN"** → Didn't switch server file
```powershell
cd backend
ls server*.js
# Must have: server.js (MongoDB version)
```

**"Cannot connect to database"** → Check MongoDB
- IP whitelist has 0.0.0.0/0
- Password correct in connection string  
- Cluster is running

**"invalid_redirect_uri"** → Check Discord
- Both redirect URLs added and saved
- No typos

---

## 📊 Your URLs

| What | URL |
|------|-----|
| Backend API | https://g2gcrm-backend-3dv1y3u22-navidams-projects.vercel.app |
| Health Check | https://g2gcrm-backend-3dv1y3u22-navidams-projects.vercel.app/api/health |
| Discord Login | https://g2gcrm-backend-3dv1y3u22-navidams-projects.vercel.app/auth/discord |
| MongoDB Atlas | https://cloud.mongodb.com |
| Discord Dev | https://discord.com/developers/applications |

---

## ✨ After Setup

1. Test locally: `npm start`
2. Login via Discord
3. Configure G2G API in Settings
4. Start managing orders/offers!

---

**Full Guides Available**:
- `MONGODB_DISCORD_SETUP.md` - Detailed setup
- `VERCEL_CHECKLIST.md` - Step-by-step checklist
- `MONGODB_MIGRATION_COMPLETE.md` - What changed

**Your backend is live! Just add MongoDB & Discord credentials! 🎉**

