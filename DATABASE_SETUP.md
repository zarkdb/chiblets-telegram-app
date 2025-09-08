# Database Setup for Production

## Option 1: Supabase (Recommended)

1. Go to [supabase.com](https://supabase.com)
2. Create a free account and new project
3. Go to Settings > Database
4. Copy the "Connection string" (it looks like):
   ```
   postgresql://postgres:[password]@[host]:5432/postgres
   ```
5. Use this as your DATABASE_URL in Netlify environment variables

## Option 2: Neon

1. Go to [neon.tech](https://neon.tech)
2. Create a free account and new project
3. Copy the connection string
4. Use this as your DATABASE_URL

## After setting up the database:

1. Update your DATABASE_URL in Netlify environment variables
2. Run database migration: `npx prisma db push`
3. Run database seed: `npx prisma db seed`

## Environment Variables needed for Netlify:

- `DATABASE_URL`: Your PostgreSQL connection string
- `TELEGRAM_BOT_TOKEN`: Your Telegram bot token
- `JWT_SECRET`: A random secret for JWT tokens (generate one)
- `NEXTAUTH_SECRET`: Same as JWT_SECRET
- `NEXTAUTH_URL`: Your deployed Netlify URL
