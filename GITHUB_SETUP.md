# GitHub Setup Guide

Follow these steps to upload your G2G CRM Dashboard to GitHub.

## Prerequisites

- [ ] Git installed on your computer
- [ ] GitHub account created
- [ ] GitHub Desktop (optional, easier) or Git Bash/Terminal

Check if Git is installed:
```bash
git --version
```

If not installed, download from: https://git-scm.com/downloads

## Method 1: Using GitHub Desktop (Recommended for Beginners)

### Step 1: Download GitHub Desktop
- Go to https://desktop.github.com/
- Download and install

### Step 2: Sign In
- Open GitHub Desktop
- Sign in with your GitHub account

### Step 3: Add Repository
1. Click **File** → **Add Local Repository**
2. Click **Choose...** and select `D:\G2G CRM`
3. Click **Create a repository** (if prompted)
4. Repository name: `g2g-crm-dashboard`
5. Description: "Full-stack CRM dashboard for G2G marketplace operations"
6. Click **Create Repository**

### Step 4: Commit Files
1. You'll see all files in the left panel
2. Write commit message: "Initial commit: Complete G2G CRM Dashboard"
3. Click **Commit to main**

### Step 5: Publish to GitHub
1. Click **Publish repository** at the top
2. Name: `g2g-crm-dashboard`
3. Description: "Full-stack CRM dashboard for G2G marketplace"
4. Choose **Public** or **Private**
5. Click **Publish Repository**

Done! Your project is now on GitHub! 🎉

## Method 2: Using Command Line

### Step 1: Initialize Git Repository

Open PowerShell in the project directory:

```bash
cd "D:\G2G CRM"
git init
```

### Step 2: Add All Files

```bash
git add .
```

### Step 3: Create Initial Commit

```bash
git commit -m "Initial commit: Complete G2G CRM Dashboard

- Full-stack React + Node.js application
- Frontend: React, Vite, Tailwind CSS
- Backend: Express, SQLite
- Features: Orders, Offers, Products, Inventory, Webhooks
- Complete documentation and setup guides"
```

### Step 4: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `g2g-crm-dashboard`
3. Description: "Full-stack CRM dashboard for G2G marketplace operations"
4. Choose **Public** or **Private**
5. **DO NOT** initialize with README (we already have one)
6. Click **Create repository**

### Step 5: Connect and Push

GitHub will show you commands. Use these (replace `YOUR_USERNAME`):

```bash
# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/g2g-crm-dashboard.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

Done! 🎉

## Verify Upload

After uploading, visit your repository on GitHub:
```
https://github.com/YOUR_USERNAME/g2g-crm-dashboard
```

You should see:
- ✅ All project files
- ✅ README.md displayed on homepage
- ✅ Folder structure (backend, frontend)
- ✅ Documentation files

## Important Notes

### Files Excluded (via .gitignore)
These files won't be uploaded to GitHub:
- `node_modules/` - Dependencies (too large)
- `*.db` - Database files (contain local data)
- `.env` - Environment variables (security)
- `dist/` - Build files (can be regenerated)

### Security
⚠️ **Important**: The `.gitignore` file prevents your API keys and database from being uploaded.

If you've already committed sensitive files:
```bash
# Remove from git (keeps local file)
git rm --cached backend/.env
git rm --cached backend/*.db

# Commit the removal
git commit -m "Remove sensitive files"

# Push changes
git push
```

## Making Updates

After making changes to your code:

### Using GitHub Desktop:
1. Changes will appear automatically
2. Write a commit message
3. Click **Commit to main**
4. Click **Push origin**

### Using Command Line:
```bash
# Check status
git status

# Add changes
git add .

# Commit with message
git commit -m "Your change description"

# Push to GitHub
git push
```

## Common Commands

```bash
# Check status
git status

# View commit history
git log --oneline

# See remote URL
git remote -v

# Pull latest changes (if working from multiple locations)
git pull

# Create a new branch
git checkout -b feature-name

# Switch branches
git checkout main
```

## Troubleshooting

### "fatal: not a git repository"
```bash
cd "D:\G2G CRM"
git init
```

### "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/g2g-crm-dashboard.git
```

### Authentication Issues
Use GitHub Personal Access Token:
1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scopes: `repo`
4. Copy token
5. Use as password when pushing

Or use SSH:
1. Generate SSH key: `ssh-keygen -t ed25519 -C "your_email@example.com"`
2. Add to GitHub: https://github.com/settings/keys
3. Use SSH URL: `git@github.com:YOUR_USERNAME/g2g-crm-dashboard.git`

### Large Files Error
If files are too large:
```bash
# Remove large files
git rm --cached path/to/large/file

# Add to .gitignore
echo "path/to/large/file" >> .gitignore

# Commit and push
git commit -m "Remove large files"
git push
```

## Repository Settings (Recommended)

After uploading, configure your repository on GitHub:

### 1. Add Topics
- Click ⚙️ next to "About"
- Add topics: `react`, `nodejs`, `crm`, `dashboard`, `sqlite`, `vite`, `tailwindcss`

### 2. Add Description
"Full-stack CRM dashboard for G2G marketplace operations with React frontend and Node.js backend"

### 3. GitHub Pages (Optional)
- Settings → Pages
- Deploy the frontend build

### 4. Add License (Optional)
- Add file → Create new file
- Name: `LICENSE`
- Choose license template (MIT, Apache, etc.)

### 5. Branch Protection (Optional)
- Settings → Branches
- Add rule for `main` branch
- Require pull request reviews

## Collaboration

To allow others to contribute:

1. **Add Collaborators**
   - Settings → Collaborators
   - Add GitHub usernames

2. **Issues**
   - Enable in Settings
   - Others can report bugs/request features

3. **Pull Requests**
   - Accept contributions from others

## Keeping Repository Updated

Create a routine for updating:

```bash
# Daily/Weekly updates
git add .
git commit -m "Update: description of changes"
git push
```

## Next Steps

After uploading to GitHub:

1. ✅ Add a nice README badge
2. ✅ Set up GitHub Actions (CI/CD)
3. ✅ Create releases/tags for versions
4. ✅ Add screenshots to README
5. ✅ Set up issue templates
6. ✅ Add contributing guidelines

## Support

- Git Documentation: https://git-scm.com/doc
- GitHub Guides: https://guides.github.com/
- GitHub Desktop: https://docs.github.com/en/desktop

---

**Ready to share your project with the world! 🚀**

