# Quick Start Guide

Get your G2G CRM Dashboard up and running in minutes!

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js version 18 or higher
- ✅ npm or yarn package manager
- ✅ G2G API Key and Base URL

### Check Node.js Version

```bash
node --version
# Should output v18.x.x or higher
```

## Installation (3 Steps)

### Step 1: Install Dependencies

Open PowerShell in the project directory and run:

```bash
npm install
```

This will install all dependencies for both backend and frontend. Wait for it to complete.

### Step 2: Start the Application

```bash
npm start
```

You should see:
- ✅ Backend running on `http://localhost:3000`
- ✅ Frontend running on `http://localhost:5173`

### Step 3: Configure API Credentials

1. Open your browser and go to: `http://localhost:5173`
2. Click on **Settings** in the sidebar
3. Enter your **G2G API Key**
4. (Optional) Update the **API Base URL** if different
5. Click **Test Connection** to verify
6. Click **Save Settings**

## First Actions

### 1. Fetch Your First Order

1. Go to **Orders** page
2. Enter an order ID (e.g., `1660548283983RS00-1`)
3. Click **Fetch Order**
4. The order will be displayed and cached in the database

### 2. Browse Products

1. Go to **Products** page
2. Select a **Service** (e.g., Gift Cards)
3. Choose a **Brand** (e.g., Apple iTunes)
4. View **Products** and their attributes
5. Copy product IDs for creating offers

### 3. Create Your First Offer

1. Go to **Offers** page
2. Click **Create Offer**
3. Fill in the form:
   - Product ID (from Products page)
   - Unit Price
   - Currency
   - Quantities
4. Click **Create**

## Common Commands

### Start Both Servers
```bash
npm start
```

### Start Backend Only
```bash
npm run backend
```

### Start Frontend Only
```bash
npm run frontend
```

### Stop Servers
Press `Ctrl + C` in the terminal

## Troubleshooting

### Port Already in Use

If you see "Port 3000 is already in use":
1. Open `backend/.env` (create if doesn't exist)
2. Add: `PORT=3001`
3. Restart the backend

### API Connection Failed

1. Verify your API key is correct
2. Check the API base URL
3. Ensure you have internet connection
4. Use the "Test Connection" button in Settings

### Database Error

If you encounter database errors:
1. Stop the application
2. Delete `backend/g2g-crm.db`
3. Restart the application (database will be recreated)

### Clear Cache

If data seems stale:
1. Go to **Settings**
2. Click **Clear All Cache**
3. Refresh the page

## Next Steps

- ✅ Explore the **Dashboard** for overview statistics
- ✅ Manage **Inventory** by uploading codes to offers
- ✅ Check **Webhook Logs** to monitor API events
- ✅ View **Store Information** to see your account details

## Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Review the API endpoints section
- Refer to G2G API documentation

---

**Happy Managing! 🚀**

