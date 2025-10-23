# Vercel Deployment Guide - IMPORTANT!

## 🚨 SQLite Won't Work on Vercel!

Your current error (`SQLITE_CANTOPEN`) happens because **Vercel is serverless** and doesn't support file-based databases like SQLite.

## ✅ Solutions

### Option 1: Use Vercel Postgres (Recommended)

**Best for production deployment on Vercel**

1. **Create Vercel Postgres Database**
   - Go to https://vercel.com/dashboard
   - Select your project
   - Go to **Storage** tab
   - Click **Create Database** → **Postgres**
   - Follow the setup wizard

2. **Get Connection Strings**
   - Vercel will auto-populate environment variables
   - Or manually copy from database settings

3. **Update Backend Code**
   - I'll create a dual database system (SQLite for local, Postgres for production)
   - Backend will auto-detect which to use

### Option 2: Use Supabase (Free & Easy)

**Great free alternative**

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Wait 2 minutes for setup

2. **Get Database URL**
   - Go to Project Settings → Database
   - Copy **Connection String** (URI mode)
   - Format: `postgresql://postgres:[YOUR-PASSWORD]@[HOST]:5432/postgres`

3. **Add to Vercel**
   - Vercel Dashboard → Project → Settings → Environment Variables
   - Add `POSTGRES_URL` with your Supabase URL

### Option 3: Deploy Elsewhere

**If you want to keep SQLite:**
- **Railway**: Supports persistent volumes
- **Fly.io**: Supports volumes
- **DigitalOcean App Platform**: Has persistent storage
- **VPS** (AWS EC2, DigitalOcean Droplet): Full control

## 📝 Steps to Fix Vercel Deployment

### Step 1: Choose Your Database

I'll implement both options:
- **Local Dev**: SQLite (works perfectly)
- **Production**: PostgreSQL (required for Vercel)

### Step 2: Setup Environment Variables

**In Vercel Dashboard:**

1. Go to your project → Settings → Environment Variables

2. Add these variables:

```env
# Required for all environments
NODE_ENV=production
SESSION_SECRET=your_random_secret_string_here
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_REDIRECT_URI=https://your-frontend.vercel.app/auth/callback
CORS_ORIGIN=https://your-frontend.vercel.app

# Database (Choose ONE option below)

# Option A: Vercel Postgres (auto-populated if using Vercel Storage)
POSTGRES_URL=postgresql://...
DATABASE_TYPE=postgres

# Option B: Supabase
POSTGRES_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
DATABASE_TYPE=postgres
```

### Step 3: Update Package.json

Add Postgres dependencies:

```json
{
  "dependencies": {
    "pg": "^8.11.3",
    "pg-hstore": "^2.3.4"
  }
}
```

### Step 4: Deploy

```bash
# Push changes to GitHub
git add .
git commit -m "Add Postgres support for Vercel"
git push

# Vercel will auto-deploy
```

## 🔐 Discord OAuth Setup

### 1. Create Discord Application

1. Go to https://discord.com/developers/applications
2. Click **New Application**
3. Name it (e.g., "G2G CRM Dashboard")
4. Click **Create**

### 2. Configure OAuth2

1. Go to **OAuth2** → **General**
2. Copy your **Client ID** and **Client Secret**
3. Add **Redirect URIs**:
   ```
   http://localhost:5173/auth/callback
   https://your-app.vercel.app/auth/callback
   ```
4. Click **Save Changes**

### 3. Add to Environment Variables

**Backend (.env):**
```env
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_REDIRECT_URI=http://localhost:5173/auth/callback
SESSION_SECRET=generate_random_string_here
```

**Frontend (.env):**
```env
VITE_DISCORD_CLIENT_ID=your_client_id
VITE_DISCORD_REDIRECT_URI=http://localhost:5173/auth/callback
```

### 4. Vercel Environment Variables

Add the same variables in Vercel Dashboard with production URLs:
```
DISCORD_REDIRECT_URI=https://your-app.vercel.app/auth/callback
CORS_ORIGIN=https://your-app.vercel.app
```

## 🚀 Quick Start (I'll implement this for you)

### What I'll Create:

1. **Dual Database System**
   - `backend/database-sqlite.js` - For local development
   - `backend/database-postgres.js` - For Vercel production
   - `backend/database.js` - Auto-detects which to use

2. **Discord OAuth**
   - Login/logout endpoints
   - User session management
   - Protected routes

3. **Environment Configuration**
   - `.env.example` files with all settings
   - Vercel-ready configuration
   - Auto-detection for local vs production

### After Implementation:

**Local Development:**
```bash
# Copy env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit with your Discord credentials
# Run normally
npm start
```

**Production (Vercel):**
```bash
# Set environment variables in Vercel Dashboard
# Push to GitHub
# Auto-deploys!
```

## ⚠️ Current Error Explained

```
SqliteError: unable to open database file
code: 'SQLITE_CANTOPEN'
```

**Why it happens:**
- Vercel uses AWS Lambda (serverless functions)
- Lambda has read-only file system
- Can't create `/var/task/backend/g2g-crm.db`
- SQLite requires writable file system

**Solution:**
- Switch to PostgreSQL for Vercel
- Keep SQLite for local development
- Code auto-detects environment

## 📊 Comparison

| Feature | SQLite (Local) | PostgreSQL (Vercel) |
|---------|---------------|---------------------|
| Setup | Zero config | Need database service |
| Cost | Free | Free tier available |
| Performance | Fast | Very fast |
| Scalability | Single machine | Multi-user, scalable |
| Vercel Compatible | ❌ No | ✅ Yes |
| Local Dev | ✅ Perfect | ✅ Works |
| Production | ❌ Limited | ✅ Recommended |

## 🎯 My Recommendation

1. **Use Supabase** (easiest & free):
   - Create project in 2 minutes
   - Copy database URL
   - Add to Vercel env vars
   - Done!

2. **Or Vercel Postgres** (if already on Vercel):
   - Click "Create Database" in Vercel
   - Auto-configures everything
   - Slightly more expensive but integrated

## 📞 Next Steps

Let me know which database solution you prefer:
1. **Vercel Postgres** - Integrated, easy
2. **Supabase** - Free tier, popular
3. **Other** - Railway, Fly.io, etc.

I'll then:
1. ✅ Implement dual database support
2. ✅ Add Discord OAuth authentication
3. ✅ Create all .env files
4. ✅ Make it Vercel-ready
5. ✅ Test and deploy

**Want me to proceed with Supabase (recommended for free tier)?**

