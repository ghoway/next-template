# Next Template

Next.js 16 starter template for Portfolio / Company Profile CMS / Mini E-Commerce style apps.

## Included Features

- App Router + feature-sliced structure (`src/features/...`)
- Auth with `next-auth` credentials provider
- RBAC (`ADMIN`, `EDITOR`, `VIEWER`)
- Prisma ORM (PostgreSQL / Prisma Accelerate compatible)
- Admin panel:
  - Dashboard
  - Users management
  - Blank page starter
- Soft delete + reactivate users
- Signed JWT `accessToken` + `refreshToken` flow
- Theme toggle (light/dark)
- Reusable modal + toast components

## Requirements

- Node.js 20+
- pnpm 10+
- PostgreSQL or Prisma Accelerate connection URL

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Configure environment in `.env`:

```env
NEXT_PUBLIC_APP_NAME="Nextz Template"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_API="http://localhost:3000/api"
DATABASE_URL="<your_database_url>"
AUTH_SECRET="<long_random_secret>"
AUTH_JWT_SECRET="<long_random_secret_for_jwt>"
ACCESS_TOKEN_DAYS="3"
REFRESH_TOKEN_DAYS="7"
```

3. Push schema:

```bash
pnpm db:push
```

4. Seed default admin:

```bash
pnpm db:seed
```

5. Run development server:

```bash
pnpm dev
```

Open `http://localhost:3000`.

## Default Admin Account

- Email: `admin@admin.dev`
- Password: `admin123`

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build production app
- `pnpm start` - Run production server
- `pnpm lint` - Run ESLint
- `pnpm db:push` - Push Prisma schema to database
- `pnpm db:seed` - Seed initial admin user
- `pnpm db:studio` - Open Prisma Studio

## Auth Token Notes

After login, client stores:

- `localStorage.accessToken`
- `localStorage.refreshToken`

`accessToken` is a signed JWT and includes user payload (`name`, `email`, `role`) and standard JWT expiry (`exp`).

## Project Structure

```text
src/
  app/
  components/
  features/
  lib/
  types/
prisma/
  schema.prisma
  seed.ts
```
