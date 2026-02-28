# Toolhaus

Privacy-first developer utility tools hub. 25+ tools, all processed in your browser.

## Stack

- Next.js 15, TypeScript, Tailwind CSS v4
- Turborepo monorepo (npm workspaces)
- Clerk (auth), Stripe (payments), Turso (database)
- shadcn/ui, nuqs (URL state), Fuse.js (search)

## Setup

```bash
npm install
cp apps/web/.env.example apps/web/.env.local
# Add your Clerk, Stripe, Turso keys to .env.local
npm run build
npm run dev
```

## Project structure

- `apps/web` — Next.js app
- `packages/tool-sdk` — shared tool types

## Deploy

Configure Vercel to use `apps/web` as the root directory. Add environment variables from `.env.example`.
