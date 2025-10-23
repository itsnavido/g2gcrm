# Configuration Guide

## 🔑 API Credentials Configuration

### Important: NO .env File Needed for API Keys!

Your G2G API credentials are **NOT** stored in .env files. They're configured through the dashboard UI for better security and ease of use.

### How to Configure API Credentials

1. **Start the Application**
   ```bash
   npm start
   ```

2. **Open Dashboard**
   - Open browser to `http://localhost:5173`

3. **Navigate to Settings**
   - Click on **Settings** in the sidebar (gear icon at bottom)

4. **Enter Your Credentials**
   - **API Key**: Enter your G2G API key
   - **API Base URL**: Usually `https://prod.your-api-server.com` (or your specific URL)

5. **Test & Save**
   - Click **Test Connection** to verify
   - Click **Save Settings** to store

### Where Are Credentials Stored?

- Stored in: `backend/g2g-crm.db` (SQLite database)
- Secure: Not in code or .env files
- Persistent: Survives server restarts
- Protected: .gitignore prevents accidental commits

---

## ⚙️ Server Configuration (Optional)

### Backend Server Settings

If you need to change the backend port or environment:

**Create file: `backend/.env`** (manually in your editor)

```env
# Backend Server Configuration
PORT=3000
NODE_ENV=development
```

**Default Values:**
- Port: `3000`
- Node Environment: `development`

### When to Create backend/.env

Only create this file if you need to:
- Change the backend port (if 3000 is in use)
- Set environment to production
- Add other server-specific variables

### Frontend Configuration

The frontend doesn't need a .env file because:
- It proxies API calls through the backend
- Vite proxy configuration handles routing
- All settings are in `frontend/vite.config.js`

---

## 📝 Step-by-Step First Run

### 1. Install Dependencies
```bash
npm install
```

### 2. (Optional) Create backend/.env
Only if you need custom settings:

```bash
# In your code editor, create: backend/.env
PORT=3000
NODE_ENV=development
```

### 3. Start the Application
```bash
npm start
```

### 4. Configure API Credentials
- Open: `http://localhost:5173`
- Go to: **Settings** page
- Enter: Your G2G API Key
- Enter: Your G2G API Base URL
- Click: **Test Connection**
- Click: **Save Settings**

### 5. Start Using!
- All pages now work
- API calls authenticated
- Data caching enabled

---

## 🔧 Configuration Files Overview

### Files You Need to Create

**None required!** The application works out of the box.

**Optional:**
- `backend/.env` - Only if you need custom server settings

### Files Already Configured

✅ `package.json` - Root workspace scripts
✅ `backend/package.json` - Backend dependencies
✅ `frontend/package.json` - Frontend dependencies
✅ `frontend/vite.config.js` - Vite & proxy config
✅ `frontend/tailwind.config.js` - Tailwind CSS config
✅ `backend/server.js` - Express server config

---

## 🚨 Common Mistakes

### ❌ DON'T: Create .env with API Key
```env
# ❌ WRONG - Don't do this!
API_KEY=your-key-here
API_BASE_URL=https://api.example.com
```

### ✅ DO: Use Settings Page
```
1. Open dashboard
2. Go to Settings
3. Enter credentials there
```

### ❌ DON'T: Commit .env files
The `.gitignore` already prevents this, but never commit:
- `.env`
- `*.db`
- API keys or secrets

### ✅ DO: Keep Credentials Secure
- Use Settings page for API credentials
- Database is gitignored automatically
- Share credentials securely with team

---

## 🔐 Security Best Practices

1. **Never commit credentials**
   - `.gitignore` protects .env and .db files
   - Double-check before pushing to GitHub

2. **Use Settings page for API keys**
   - Stored in local database
   - Not exposed in code
   - Backend proxy protects credentials

3. **Rotate keys regularly**
   - Easy to update in Settings page
   - No code changes needed

4. **Team sharing**
   - Each developer configures their own API keys
   - Share credentials securely (not in code)

---

## 📊 Configuration Summary

| Setting | Location | Required | Default |
|---------|----------|----------|---------|
| **G2G API Key** | Settings Page | ✅ Yes | None |
| **G2G API Base URL** | Settings Page | ✅ Yes | https://prod.your-api-server.com |
| **Backend Port** | backend/.env | ❌ No | 3000 |
| **Frontend Port** | vite.config.js | ❌ No | 5173 |
| **Node Environment** | backend/.env | ❌ No | development |

---

## 🆘 Troubleshooting

### "API key not configured" Error

**Problem**: Trying to use features without configuring API key

**Solution**:
1. Go to Settings page
2. Enter your API credentials
3. Click "Save Settings"

### Port 3000 Already in Use

**Problem**: Another application using port 3000

**Solution**:
1. Create `backend/.env`
2. Add: `PORT=3001`
3. Restart backend

### Can't Find .env File

**Answer**: That's normal! You don't need a .env file for API credentials. Use the Settings page instead.

**Only create .env if**:
- You need to change the backend port
- You have other server-specific settings

---

## 📞 Quick Reference

### To Configure API Credentials:
```
Dashboard → Settings → Enter API Key → Test → Save
```

### To Change Backend Port:
```
Create: backend/.env
Add: PORT=3001
Restart: npm start
```

### To View Current Settings:
```
Dashboard → Settings (see current API configuration)
```

---

## ✅ Verification Checklist

After configuration:

- [ ] Application starts without errors
- [ ] Can access `http://localhost:5173`
- [ ] Settings page shows API configuration
- [ ] "Test Connection" button works
- [ ] Can fetch orders
- [ ] Can browse products
- [ ] All pages load correctly

If all checked, you're configured correctly! 🎉

---

**Need Help?** Check README.md or QUICKSTART.md for more information.

