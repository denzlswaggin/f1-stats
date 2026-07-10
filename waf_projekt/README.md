# F1 Stats & Card Collection

A Next.js dashboard for real-time Formula 1 statistics and a driver card collection mini-game.

## Features
- **Live F1 Dashboard**: Real-time driver/constructor standings and next race countdown.
- **Card Game**: Collect F1 drivers, earn coins, and track your points.
- **User Accounts**: Secure login powered by NextAuth.

## Tech Stack
- **Frontend**: Next.js (App Router), Tailwind CSS v4, Shadcn UI
- **Backend**: PostgreSQL, Prisma ORM, NextAuth
- **Testing**: Cypress

## Quick Start

```bash
# 1. Clone & install
git clone https://github.com/denzlswaggin/f1-stats.git
cd f1-stats
npm install

# 2. Setup environment variables in .env
# DATABASE_URL="postgresql://user:password@localhost:5432/f1_stats"
# AUTH_SECRET="your-secret"

# 3. Init Database & Run
npx prisma generate
npx prisma db push
npm run dev
```

## Testing
```bash
npx cypress open
```
