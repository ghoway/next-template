# Next Template

Production-ready Next.js 16 starter with JWT auth, dynamic RBAC, Prisma, and an extensible admin panel.

## Highlights

- Next.js App Router + feature-sliced architecture (`src/features/*`)
- Auth.js credentials login + signed JWT access/refresh token flow
- Dynamic RBAC roles (database-backed): role CRUD from admin panel
- Default system roles: `ADMIN`, `USERS`
- Prisma ORM with PostgreSQL + Prisma Accelerate runtime support
- Admin panel modules:
  - Dashboard widgets (`Total Users`, `Admin`, `User`)
  - Users management (DataTable, search, sorting, confirmation modals)
  - Archived users DataTable + reactivation flow
  - Role Based CRUD (create, edit, remove role)
  - Blank starter module page
- Route top-loader for admin navigation
- Reusable UI primitives: modal, toast, table, DataTable, shadcn Select
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
- PostgreSQL URL
- Optional Prisma Accelerate URL for runtime

## Quick Start

1. Install dependencies

```bash
pnpm install
```

2. Create `.env` (example values only, no real credentials)

```env
NEXT_PUBLIC_APP_NAME="Nextz Template"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_API="http://localhost:3000/api"
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=lorem_ipsum"
DIRECT_DATABASE_URL="postgresql://john_doe:lorem_ipsum@localhost:5432/next_template?schema=public"
AUTH_SECRET="lorem-ipsum-auth-secret-change-me"
AUTH_JWT_SECRET="lorem-ipsum-jwt-secret-change-me"
ACCESS_TOKEN_DAYS="3"
REFRESH_TOKEN_DAYS="7"
```

3. Reset/push Prisma schema (uses `DIRECT_DATABASE_URL` if present)

```bash
pnpm db:push -- --force-reset
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

## Authentication Behavior

- If user is already authenticated, `/admin/login` redirects to `/admin`.
- If `accessToken` expires, app attempts refresh using `refreshToken`.
- If `refreshToken` is expired/invalid, user is redirected to sign in again.

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
    api/admin/roles
    api/admin/users
  components/
    ui/
  features/
  lib/
  types/
prisma/
  migrations/
  schema.prisma
  seed.ts
```
