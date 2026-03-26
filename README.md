# Next Template

Production-ready Next.js 16 starter with RBAC auth, Prisma, and an admin panel you can extend quickly.

## Highlights

- Next.js App Router + feature-sliced architecture (`src/features/*`)
- Auth.js credentials login + signed JWT access/refresh token flow
- RBAC roles: `ADMIN`, `EDITOR`, `VIEWER`
- Prisma ORM with PostgreSQL and Prisma Accelerate support
- Admin panel modules:
  - Interactive dashboard widgets
  - Users management (DataTable, search, sorting, confirm modals)
  - Archived users DataTable + reactivate flow
  - Blank starter module page
- Route top-loader for admin navigation
- Reusable UI primitives: modal, toast, table, DataTable
- Light/dark mode toggle

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Prisma 7
- Auth.js (`next-auth`)

## Requirements

- Node.js 20+
- pnpm 10+
- PostgreSQL URL (or Prisma Accelerate URL)

## Quick Start

1. Install dependencies

```bash
pnpm install
```

2. Create `.env` (example values only)

```env
NEXT_PUBLIC_APP_NAME="Nextz Template"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_API="http://localhost:3000/api"
DATABASE_URL="postgresql://john_doe:lorem_ipsum@localhost:5432/next_template"
AUTH_SECRET="lorem-ipsum-auth-secret-change-me"
AUTH_JWT_SECRET="lorem-ipsum-jwt-secret-change-me"
ACCESS_TOKEN_DAYS="3"
REFRESH_TOKEN_DAYS="7"
```

3. Push Prisma schema

```bash
pnpm db:push
```

4. Seed demo admin user

```bash
pnpm db:seed
```

5. Run app

```bash
pnpm dev
```

Open: `http://localhost:3000`

## Demo Admin (Seed)

- Name: `John Doe`
- Email: `john.doe@example.com`
- Password: `loremipsum123`

Use this account for local development only.

## Available Scripts

- `pnpm dev` - start development server
- `pnpm build` - build for production
- `pnpm start` - run production build
- `pnpm lint` - run ESLint
- `pnpm db:push` - push Prisma schema
- `pnpm db:seed` - seed demo admin user
- `pnpm db:studio` - open Prisma Studio

## Security Notes

- `.env*` is gitignored in this template.
- Never commit real database URLs, API keys, or production secrets.
- Replace all demo values before deploying.

## Project Structure

```text
src/
  app/
  components/
    ui/
  features/
  lib/
  types/
prisma/
  schema.prisma
  seed.ts
```
