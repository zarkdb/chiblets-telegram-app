# Complete Netlify Deployment Guide

## Current Status ✅
- ✅ New Netlify account logged in: stefinsaji101jp@gmail.com
- ✅ Git repository initialized
- ✅ Code committed locally
- ✅ Netlify configuration file created

## Next Steps:

### Step 1: Set up your new Git account

If you want to use a different Git account, run:
```bash
git config --global user.email "your-preferred-email@example.com"
git config --global user.name "YourPreferredUsername"
```

### Step 2: Create GitHub repository

1. Go to https://github.com and sign in with your preferred account
2. Create a new repository called "chiblets-telegram-app"
3. Don't initialize with README (we have files already)

### Step 3: Connect and push to GitHub

```bash
# Add remote repository (replace with your actual repo URL)
git remote add origin https://github.com/YOUR-USERNAME/chiblets-telegram-app.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 4: Deploy to Netlify from GitHub

Option A - Via Netlify Web Interface (Recommended):
1. Go to https://app.netlify.com
2. Click "New site from Git"
3. Choose GitHub
4. Select your repository "chiblets-telegram-app"
5. Build settings should auto-detect:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Click "Deploy site"

Option B - Via CLI:
```bash
netlify init
# Choose: "Create & configure a new site"
# Follow the prompts
```

### Step 5: Configure Environment Variables in Netlify

Go to your Netlify site dashboard > Site configuration > Environment variables

Add these variables:
```
DATABASE_URL = "postgresql://neondb_owner:npg_V2uxYZAFrt0G@ep-purple-fog-a9mvjmdk-pooler.gwc.azure.neon.tech/neondb?sslmode=require&channel_binding=require"

TELEGRAM_BOT_TOKEN = "8270321275:AAG9kgRwVbFUojZ6cYLisFEaaf--IVKivTU"

JWT_SECRET = "b63fed4a3b18e97cfa62c6050dbf53a651b007c4e9b2cce7cc9df32429249821"

NEXT_PUBLIC_APP_URL = "https://YOUR-NETLIFY-SITE-URL.netlify.app"

NEXT_PUBLIC_GAME_NAME = "ChibletsLite"

NODE_ENV = "production"
```

### Step 6: Set up database

After deployment, run these commands to set up your production database:

```bash
# Install dependencies (if needed)
npm install

# Push database schema
npx prisma db push

# Seed the database
npx prisma db seed
```

### Step 7: Update Telegram Bot Webhook

After your site is deployed, update your Telegram bot webhook:
1. Get your Netlify site URL (e.g., https://amazing-site-123456.netlify.app)
2. Update NEXT_PUBLIC_APP_URL in environment variables
3. Set your Telegram bot webhook to: `https://your-site.netlify.app`

## Manual Deploy Option (Quick Test)

If you want to deploy quickly without GitHub:

```bash
# Build the project
npm run build

# Deploy manually
netlify deploy --prod --dir=.next
```

This will give you a preview URL to test immediately.
