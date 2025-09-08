# 🚀 Chiblets Telegram Mini App - Deployment Guide

## 📋 Prerequisites
- Node.js 18+
- Git
- Telegram account

## 1️⃣ Database Setup (Railway - Recommended)

### A. Create Database
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "Start a New Project"
4. Choose "Provision PostgreSQL"
5. Copy the connection string from "Connect" tab

### B. Update Environment
```bash
# Create .env file
cp .env.example .env

# Edit .env and add:
DATABASE_URL="your_railway_postgres_connection_string"
TELEGRAM_BOT_TOKEN="your_bot_token_from_step_2"
NEXTAUTH_SECRET="your-random-secret-string"
```

## 2️⃣ Create Telegram Bot

### A. Talk to BotFather
1. Open Telegram and message [@BotFather](https://t.me/botfather)
2. Send `/newbot`
3. Bot name: `Chiblets Game`
4. Bot username: `ChibletsGameBot` (or your choice)
5. **Save the bot token!**

### B. Configure Bot
```
Send to BotFather:

/setcommands
start - Start your Chiblets adventure
game - Play Chiblets
help - Get help

/setdescription
Battle and collect adorable creatures called Chiblets! Level them up through PvP battles and climb the leaderboard.

/setabouttext  
A fun creature collection and battle game for Telegram.
```

## 3️⃣ Deploy to Vercel

### A. Install Vercel CLI
```bash
npm install -g vercel
```

### B. Deploy
```bash
# From your project root
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: chiblets-game
# - Directory: ./
# - Override settings? No
```

### C. Add Environment Variables
```bash
# After deployment, add environment variables:
vercel env add DATABASE_URL
# Paste your Railway database URL

vercel env add TELEGRAM_BOT_TOKEN
# Paste your bot token

vercel env add NEXTAUTH_SECRET
# Enter a random string

# Redeploy with environment variables
vercel --prod
```

## 4️⃣ Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed with initial data
npx prisma db seed
```

## 5️⃣ Configure Mini App

### A. Create Mini App
Send to BotFather:
```
/newapp
# Choose your bot
# App name: Chiblets
# Description: Battle and collect cute creatures!
# Photo: Upload a 640x360 image/GIF
# App URL: https://your-vercel-app.vercel.app
```

### B. Test the Integration
1. Start your bot: `/start`
2. Open the mini app
3. Check if authentication works
4. Try spinning the wheel
5. Test PvP battles

## 6️⃣ Final Bot Setup

### A. Welcome Message
Send to BotFather:
```
/setcommands
start - Start your adventure 🐾
game - Play Chiblets ⚔️
leaderboard - View top players 🏆
help - Get help ❓
```

### B. Inline Mode (Optional)
```
/setinline
# Enable inline mode for sharing
```

## 🎉 You're Live!

Your Telegram Mini App is now deployed and ready! Share your bot with friends:
- Bot link: `https://t.me/YourBotUsername`
- Direct game link: `https://t.me/YourBotUsername/game`

## 📊 Monitor Performance

### Check Logs
```bash
# View Vercel logs
vercel logs

# Check Railway database
# Use Railway dashboard to monitor DB performance
```

### Common Issues
1. **Database connection errors**: Check DATABASE_URL format
2. **Telegram auth fails**: Verify TELEGRAM_BOT_TOKEN
3. **Builds fail**: Check Node.js version (use 18+)

## 🔧 Environment Variables Checklist

Make sure these are set in Vercel:
- ✅ `DATABASE_URL`
- ✅ `TELEGRAM_BOT_TOKEN` 
- ✅ `NEXTAUTH_SECRET`
- ✅ `NODE_ENV` (should be "production")

---

## 🚨 Quick Deploy Commands

```bash
# One-time setup
npm install -g vercel
cp .env.example .env
# Edit .env with your values

# Database setup
npx prisma generate
npx prisma db push
npx prisma db seed

# Deploy
vercel
# Add environment variables via Vercel dashboard
vercel --prod

# Test
curl https://your-app.vercel.app/api/auth/telegram
```

Your Chiblets game is now live! 🎮✨
