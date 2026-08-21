# Odoo_Ahmedabad — Hackathon Boilerplate

Pre-built tonight so 8:30am tomorrow goes straight into domain work.
Stack: React + Vite + TS + Tailwind (frontend) · Express + Prisma + PostgreSQL + Socket.io + JWT (backend).

Pre-fixed from past hackathons:
- ✅ Prisma Windows `DATABASE_URL` datasource error (see `backend/.env.example`)
- ✅ Role self-assignment vulnerability (signup never trusts `role` from client)
- ✅ Compound unique constraint pattern documented in `schema.prisma`
- ✅ Global error middleware + Zod validation wired in
- ✅ Auth (signup/login/me) working end-to-end, JWT + protected routes on frontend

## Tonight / before 8:30am
```bash
# Backend
cd backend
npm install
cp .env.example .env   # set DATABASE_URL + JWT_SECRET
npx prisma generate
npx prisma migrate dev --name init
npm run dev             # http://localhost:5000

# Frontend
cd frontend
npm install
npm run dev              # http://localhost:5173
```
Test: signup → login → dashboard loads → confirms full stack is wired.

## Tomorrow — once PS drops (8:30–5:00, code freeze 3:00pm)

| Time | Task |
|---|---|
| 8:30–9:00 | Read PS, lock idea/differentiator |
| 9:00–9:20 | Update this repo: rename models, assign roles (backend / frontend / integration) |
| 9:20–11:00 | Extend `schema.prisma` with domain models, build core API routes |
| 11:00–1:00 | Build domain frontend pages on top of existing shell/auth |
| 1:00–1:30 | Buffer / food |
| 1:30–2:30 | Integration + the one differentiating "wow" feature |
| 2:30–3:00 | Bug fixes, freeze — commit + tag stable version |
| 3:00–4:00 | Deploy (Render/Railway backend, Vercel frontend) |
| 4:00–5:00 | Demo video + submission |

## What NOT to touch tomorrow (already solved)
- Auth flow, JWT, protected routes
- Error handling middleware
- Prisma client singleton / Windows env fix
- Tailwind theme tokens (`tailwind.config.js`) — just reskin colors if needed

## Extending for the real PS
1. Add models to `backend/prisma/schema.prisma`, run `npx prisma migrate dev --name domain`
2. Create `backend/src/controllers/<domain>.controller.js` + `routes/<domain>.routes.js`, register in `routes/index.js`
3. Add frontend pages in `frontend/src/pages/`, add routes in `App.tsx`
4. Use `socket.io` (`backend` → `req.app.get("io").emit(...)`, `frontend` → `src/lib/socket.ts`) for any real-time feature — good differentiator if PS allows it
