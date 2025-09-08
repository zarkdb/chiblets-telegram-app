@echo off
echo Starting Chiblets Telegram Mini App Development Server...
echo.
echo Make sure you have:
echo 1. PostgreSQL database running
echo 2. .env file configured with DATABASE_URL and TELEGRAM_BOT_TOKEN
echo 3. Database seeded (npm run db:seed if needed)
echo.
echo Starting Next.js development server on http://localhost:3000
echo.
npm run dev
