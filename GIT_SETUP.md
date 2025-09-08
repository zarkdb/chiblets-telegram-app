# Git Account Setup

## Step 1: Configure Git with your new account

Run these commands with your new account details:

```bash
# Set your new email
git config --global user.email "your-new-email@example.com"

# Set your new username
git config --global user.name "YourNewUsername"
```

## Step 2: Update this project's Git config (optional - for this project only)

If you want different settings just for this project:

```bash
# Local config for this project only
git config user.email "your-new-email@example.com"
git config user.name "YourNewUsername"
```

## Step 3: Create new GitHub repository

1. Go to https://github.com
2. Sign in with your new account
3. Click "New repository"
4. Name it "chiblets-telegram-app" or similar
5. Keep it public or private (your choice)
6. Don't initialize with README (we already have files)
7. Click "Create repository"

## Step 4: Connect local repository to GitHub

After creating the repository, run:

```bash
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git branch -M main
git push -u origin main
```

Replace YOUR-USERNAME and YOUR-REPO-NAME with your actual values.
