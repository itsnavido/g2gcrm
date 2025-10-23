# Command Reference

Quick reference for all available commands in the G2G CRM Dashboard project.

## Installation

```bash
# Install all dependencies (backend + frontend)
npm install

# Install backend dependencies only
cd backend && npm install

# Install frontend dependencies only
cd frontend && npm install
```

## Development

```bash
# Run both backend and frontend concurrently
npm start
# or
npm run dev

# Run backend only (port 3000)
npm run backend

# Run frontend only (port 5173)
npm run frontend

# Run backend with nodemon (auto-reload)
cd backend && npm run dev

# Run frontend with Vite dev server
cd frontend && npm run dev
```

## Building

```bash
# Build frontend for production
cd frontend && npm run build

# Preview production build
cd frontend && npm run preview
```

## Database Management

The SQLite database is automatically created and managed by the backend.

```bash
# Database file location
backend/g2g-crm.db

# To reset the database (stop server first)
rm backend/g2g-crm.db

# Database will be recreated on next server start
```

## Testing

```bash
# Test API connection (via Settings page in dashboard)
# Or use curl:
curl http://localhost:3000/api/health

# Expected response:
# {"status":"ok","timestamp":1234567890}
```

## Project Structure Commands

```bash
# View project structure
tree /F

# Or on PowerShell
Get-ChildItem -Recurse -Directory | Select-Object FullName
```

## Port Management

### Check if ports are in use (PowerShell):

```powershell
# Check port 3000 (backend)
netstat -ano | findstr :3000

# Check port 5173 (frontend)
netstat -ano | findstr :5173
```

### Kill process on port (PowerShell):

```powershell
# Find process ID
netstat -ano | findstr :3000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

## Cleaning

```bash
# Remove all node_modules
rm -rf node_modules backend/node_modules frontend/node_modules

# Remove build artifacts
rm -rf frontend/dist

# Remove database
rm backend/g2g-crm.db

# Clean and reinstall
npm run clean && npm install
```

## Environment Configuration

```bash
# Backend environment (create backend/.env)
PORT=3000
NODE_ENV=development

# No .env needed for frontend (uses Vite proxy)
```

## Git Commands

```bash
# Initialize git repository (if not already)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: G2G CRM Dashboard"

# View status
git status

# View git log
git log --oneline
```

## Troubleshooting Commands

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Clear npm cache
npm cache clean --force

# Verify package installations
npm list --depth=0

# Check for outdated packages
npm outdated

# Update packages
npm update
```

## API Testing with curl

```bash
# Health check
curl http://localhost:3000/api/health

# Get settings
curl http://localhost:3000/api/settings

# Get stats
curl http://localhost:3000/api/stats

# Get orders
curl http://localhost:3000/api/orders

# Get offers
curl http://localhost:3000/api/offers

# Get services
curl http://localhost:3000/api/services
```

## Useful PowerShell Commands

```powershell
# Navigate to project directory
cd "D:\G2G CRM"

# Open in VS Code
code .

# Open in default browser
start http://localhost:5173

# List running Node processes
Get-Process node

# Stop all Node processes (use with caution!)
Get-Process node | Stop-Process

# View file contents
Get-Content README.md

# Search for text in files
Select-String -Path "*.js" -Pattern "G2GAPI"
```

## Logs and Debugging

```bash
# View backend logs (while running)
# Logs appear in the terminal where you ran npm run backend

# View frontend logs
# Open browser DevTools (F12) and check Console tab

# Enable debug mode (backend)
# Add to backend/.env:
DEBUG=*

# Enable verbose logging
NODE_ENV=development npm run backend
```

## Package Management

```bash
# Add new backend dependency
cd backend && npm install <package-name>

# Add new frontend dependency
cd frontend && npm install <package-name>

# Add dev dependency
npm install --save-dev <package-name>

# Remove dependency
npm uninstall <package-name>

# Update specific package
npm update <package-name>
```

## Quick Fixes

```bash
# If backend won't start
1. Check if port 3000 is available
2. Delete backend/node_modules and reinstall
3. Delete backend/g2g-crm.db and restart

# If frontend won't start
1. Check if port 5173 is available
2. Delete frontend/node_modules and reinstall
3. Clear browser cache and restart

# If database errors occur
1. Stop the server
2. Delete backend/g2g-crm.db
3. Restart the server (database recreates automatically)

# If API calls fail
1. Check Settings page for correct API credentials
2. Use "Test Connection" button
3. Check internet connection
4. Verify API base URL
```

---

**For more detailed information, see [README.md](README.md) and [QUICKSTART.md](QUICKSTART.md)**

