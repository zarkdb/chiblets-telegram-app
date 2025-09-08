# 🔗 Connect to GitHub and Deploy via Vercel

## Step 1: Create GitHub Repository

1. Go to: https://github.com
2. Click "New" (green button)
3. Repository name: `chiblets-telegram-app`
4. Description: `Telegram Mini App for Chiblets Game with PvP battles`
5. Keep it Public
6. Don't initialize with anything
7. Click "Create repository"

## Step 2: Connect Local Repository

After creating the repository, run these commands (replace YOUR-USERNAME):

```bash
git remote add origin https://github.com/YOUR-USERNAME/chiblets-telegram-app.git
git push -u origin main
```

## Step 3: Import to Vercel

1. Go to: https://vercel.com/dashboard
2. Click "New Project"
3. Choose "Import Git Repository"
4. Select your `chiblets-telegram-app` repository
5. Settings will auto-detect (Next.js framework)
6. Add Environment Variables:
   - DATABASE_URL
   - TELEGRAM_BOT_TOKEN  
   - JWT_SECRET
   - NODE_ENV
7. Click "Deploy"

## Step 4: Update Webhook

After deployment, update your Telegram webhook with the new Vercel URL.

## Benefits:

✅ **Auto-deployment** on every git push
✅ **Preview deployments** for testing
✅ **Easy collaboration**
✅ **Version control**
✅ **Professional workflow**

This is the industry standard way to deploy apps!
