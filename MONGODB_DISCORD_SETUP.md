# MongoDB + Discord OAuth Setup Guide

Complete guide to set up MongoDB Atlas (FREE) and Discord OAuth for your G2G CRM Dashboard.

## 🗄️ MongoDB Atlas Setup (FREE Tier)

### Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up (it's completely FREE)
3. Choose **Shared** (FREE tier - 512MB storage)
4. Select your preferred cloud provider and region
5. Click **Create Cluster** (takes 3-5 minutes)

### Step 2: Create Database User

1. On the left sidebar, click **Database Access**
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Username: `g2gcrm` (or any name)
5. Password: Click **Autogenerate Secure Password** (copy this!)
6. Database User Privileges: **Read and write to any database**
7. Click **Add User**

### Step 3: Allow Network Access

1. On the left sidebar, click **Network Access**
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (for development)
   - This adds `0.0.0.0/0`
   - For production, add specific IPs
4. Click **Confirm**

### Step 4: Get Connection String

1. Go back to **Database** (left sidebar)
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Driver: **Node.js**
5. Version: **4.1 or later**
6. Copy the connection string, it looks like:
   ```
   mongodb+srv://g2gcrm:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. Replace `<password>` with your actual password
8. Add database name before the `?`:
   ```
   mongodb+srv://g2gcrm:YourPassword@cluster0.xxxxx.mongodb.net/g2gcrm?retryWrites=true&w=majority
   ```

### Step 5: Add to .env File

Create `backend/.env`:

```env
MONGODB_URI=mongodb+srv://g2gcrm:YourPassword@cluster0.xxxxx.mongodb.net/g2gcrm?retryWrites=true&w=majority
```

Done! MongoDB is ready! ✅

---

## 🎮 Discord OAuth Setup

### Step 1: Create Discord Application

1. Go to https://discord.com/developers/applications
2. Click **New Application**
3. Name: `G2G CRM Dashboard` (or any name)
4. Read and accept terms
5. Click **Create**

### Step 2: Get Client ID and Secret

1. You're now on your application page
2. Copy the **Application ID** (this is your Client ID)
3. Go to **OAuth2** → **General** (left sidebar)
4. Click **Reset Secret** to generate a new Client Secret
5. Copy the **Client Secret** (you can only see it once!)

### Step 3: Add Redirect URLs

1. Still in **OAuth2** → **General**
2. Scroll to **Redirects**
3. Click **Add Redirect**
4. Add these URLs:
   ```
   http://localhost:3000/auth/discord/callback
   ```
   For production, also add:
   ```
   https://your-backend.vercel.app/auth/discord/callback
   ```
5. Click **Save Changes**

### Step 4: Configure Scopes (Optional)

1. The app will request `identify` and `email` scopes
2. These are configured in the backend code
3. No additional setup needed

### Step 5: Add to .env File

Add to `backend/.env`:

```env
DISCORD_CLIENT_ID=your_application_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here
DISCORD_CALLBACK_URL=http://localhost:3000/auth/discord/callback
```

Add to `frontend/.env`:

```env
VITE_DISCORD_CLIENT_ID=your_application_id_here
```

Done! Discord OAuth is ready! ✅

---

## 🔐 Session Secret

Generate a secure random string for sessions:

### On Windows (PowerShell):
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add to `backend/.env`:
```env
SESSION_SECRET=the_generated_random_string_here
```

---

## ✅ Complete Backend .env File

Here's what your `backend/.env` should look like:

```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB Atlas
MONGODB_URI=mongodb+srv://g2gcrm:YourPassword@cluster0.xxxxx.mongodb.net/g2gcrm?retryWrites=true&w=majority

# Discord OAuth
DISCORD_CLIENT_ID=1234567890123456789
DISCORD_CLIENT_SECRET=your_secret_here
DISCORD_CALLBACK_URL=http://localhost:3000/auth/discord/callback

# Session
SESSION_SECRET=your_random_32_byte_hex_string_here

# CORS
CORS_ORIGIN=http://localhost:5173

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

---

## ✅ Complete Frontend .env File

Here's what your `frontend/.env` should look like:

```env
VITE_API_URL=http://localhost:3000
VITE_DISCORD_CLIENT_ID=1234567890123456789
```

---

## 🚀 Testing Your Setup

### 1. Install Dependencies

```bash
# In root directory
npm install

# Or separately
cd backend && npm install
cd ../frontend && npm install
```

### 2. Rename server-mongodb.js

```bash
cd backend
# Backup old server
mv server.js server-sqlite.js
# Use new MongoDB server
mv server-mongodb.js server.js
```

### 3. Start the Application

```bash
# In root directory
npm start
```

### 4. Test MongoDB Connection

1. Open http://localhost:3000/api/health
2. Should see: `"database": "connected"`

### 5. Test Discord OAuth

1. Open http://localhost:5173
2. You should see a login page or be redirected to Discord
3. Click "Login with Discord"
4. Authorize the application
5. You'll be redirected back to the dashboard

---

## 🌐 Deploy to Vercel

### Step 1: Add Environment Variables to Vercel

1. Go to https://vercel.com/dashboard
2. Select your project (backend)
3. Go to **Settings** → **Environment Variables**
4. Add ALL the variables from your `backend/.env`:
   - `MONGODB_URI`
   - `DISCORD_CLIENT_ID`
   - `DISCORD_CLIENT_SECRET`
   - `DISCORD_CALLBACK_URL` (use production URL)
   - `SESSION_SECRET`
   - `CORS_ORIGIN` (use production frontend URL)
   - `FRONTEND_URL` (use production frontend URL)
   - `NODE_ENV` = `production`

### Step 2: Update Discord Redirect URLs

1. Go back to https://discord.com/developers/applications
2. Select your application
3. OAuth2 → General → Redirects
4. Add production URL:
   ```
   https://your-backend.vercel.app/auth/discord/callback
   ```
5. Save Changes

### Step 3: Deploy

```bash
git add .
git commit -m "Migrate to MongoDB and add Discord OAuth"
git push
```

Vercel will automatically deploy!

---

## 🎉 You're Done!

Your G2G CRM Dashboard now has:
- ✅ MongoDB database (works on Vercel!)
- ✅ Discord OAuth authentication
- ✅ Session management
- ✅ Production-ready configuration

## 🆘 Troubleshooting

### MongoDB Connection Error

**Error**: `MongooseServerSelectionError`

**Solutions**:
1. Check your connection string is correct
2. Make sure you replaced `<password>` with actual password
3. Verify Network Access allows your IP (0.0.0.0/0 for all)
4. Wait 2-3 minutes after creating cluster

### Discord OAuth Not Working

**Error**: `invalid_redirect_uri`

**Solutions**:
1. Check redirect URL matches exactly in Discord app settings
2. Make sure you saved changes in Discord developer portal
3. Verify DISCORD_CALLBACK_URL in .env matches

### Session Not Persisting

**Solutions**:
1. Check SESSION_SECRET is set in .env
2. Verify CORS_ORIGIN matches your frontend URL
3. For production, ensure cookies are secure (HTTPS)

### "Not Authenticated" Error

**Solutions**:
1. Login through Discord first
2. Check if session cookies are being set
3. Verify MongoDB is connected (check /api/health)

---

## 📞 Need Help?

- MongoDB Docs: https://docs.mongodb.com/
- Discord OAuth Docs: https://discord.com/developers/docs/topics/oauth2
- Passport.js Docs: http://www.passportjs.org/

**Enjoy your new authenticated, database-powered dashboard! 🎊**

