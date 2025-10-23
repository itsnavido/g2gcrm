# Switch from SQLite to MongoDB

Quick guide to switch your backend to MongoDB.

## 🔄 One-Command Switch

```bash
cd backend
mv server.js server-sqlite-backup.js
mv server-mongodb.js server.js
```

That's it! The backend now uses MongoDB instead of SQLite.

## 📝 Setup Steps

1. **Follow MongoDB Setup**
   - Read `MONGODB_DISCORD_SETUP.md`
   - Create MongoDB Atlas account (FREE)
   - Get connection string
   - Add to `backend/.env`

2. **Install New Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Create `.env` Files**
   
   **backend/.env**:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/g2gcrm
   DISCORD_CLIENT_ID=your_client_id
   DISCORD_CLIENT_SECRET=your_client_secret
   DISCORD_CALLBACK_URL=http://localhost:3000/auth/discord/callback
   SESSION_SECRET=generate_random_string
   CORS_ORIGIN=http://localhost:5173
   FRONTEND_URL=http://localhost:5173
   ```
   
   **frontend/.env**:
   ```env
   VITE_API_URL=http://localhost:3000
   VITE_DISCORD_CLIENT_ID=your_client_id
   ```

4. **Start Application**
   ```bash
   npm start
   ```

## ✅ Benefits of MongoDB

- ✅ Works on Vercel (serverless)
- ✅ Free 512MB storage
- ✅ Cloud-hosted (accessible anywhere)
- ✅ Automatic backups
- ✅ Better scalability
- ✅ No file system required

## 🔙 Revert to SQLite (if needed)

```bash
cd backend
mv server.js server-mongodb.js
mv server-sqlite-backup.js server.js
```

## 🆘 Troubleshooting

### Dependencies not installed

```bash
cd backend
npm install mongoose express-session passport passport-discord connect-mongo
```

### Port conflict

Change PORT in `backend/.env`:
```env
PORT=3001
```

### MongoDB connection fails

1. Check connection string format
2. Replace `<password>` with actual password
3. Allow IP access (0.0.0.0/0) in MongoDB Atlas
4. Wait 2-3 minutes after creating cluster

## 📚 Documentation

- Full Setup: `MONGODB_DISCORD_SETUP.md`
- Vercel Deploy: `VERCEL_DEPLOYMENT_GUIDE.md`
- Main README: `README.md`

---

**Need help? Check MONGODB_DISCORD_SETUP.md for detailed instructions!**

