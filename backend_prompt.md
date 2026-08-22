You are building the COMPLETE backend for GlobeTrotter, an 8-hour Odoo Hackathon MVP — a multi-city travel planning app. The frontend is React (Vite) + Tailwind, already scoped with these exact screens: Login/Signup, Dashboard, Create Trip, Itinerary Builder (sections), Itinerary View + Budget, My Trips, City/Activity Search, Profile, Calendar, Community, Shared/Public View, Admin (optional).

Do not add features, AI, or extra modules beyond what's listed below.

TECH STACK (mandatory):
Node.js, Express.js, TypeScript, PostgreSQL, Prisma ORM, JWT auth, bcrypt, Zod validation, Helmet, CORS, express-rate-limit.

DATA MODEL (design this in Prisma — field names must match what the frontend already expects):
- User: id, firstName, lastName, username (unique), email (unique), phone, city, country, photo, passwordHash, language, timestamps
- Trip: id, userId (FK), name, description, coverPhoto, startDate, endDate, isPublic (bool, default false), shareSlug (unique, nullable), timestamps
- Section: id, tripId (FK), cityId (FK), order (int), startDate, endDate, budget (decimal — this is a manually-entered TARGET budget per section, separate from actual spend)
- City: id, name, country, costIndex (float), popularity (int), imageUrl
- Activity: id, cityId (FK), name, type (enum: SIGHTSEEING, FOOD, ADVENTURE, CULTURE, OTHER), category (enum: TRANSPORT, STAY, ACTIVITIES, MEALS — used for cost breakdown chart), cost (decimal), durationMinutes (int), description, imageUrl
- SectionActivity: id, sectionId (FK), activityId (FK), scheduledDate, costSnapshot (decimal, copied from Activity.cost when added)

Seed City (~15 cities) and Activity (~5 per city, spread across all 4 categories) so search/browse and the budget-by-category chart actually have real data to render.

FOLDER STRUCTURE:
src/{config,controllers,routes,services,middleware,validators,utils,types,prisma}/ + app.ts + server.ts
All business logic in services/, never in controllers or routes.

BUILD IN THIS ORDER (matches frontend build order — ship each slice working before the next):

1. Auth: POST /api/auth/register (accepts firstName, lastName, username, email, phone, city, country, password, photo optional), POST /api/auth/login, GET /api/users/me — JWT protected after this point.

2. Trips: POST /api/trips (create), GET /api/trips (My Trips — list mine), GET/PATCH/DELETE /api/trips/:id (ownership-checked).

3. Sections (Itinerary Builder — build this most carefully, it's the core screen):
   - POST /api/trips/:tripId/sections (add a section: cityId, startDate, endDate, budget)
   - PATCH /api/sections/:id (edit dates/budget)
   - DELETE /api/sections/:id
   - PATCH /api/trips/:tripId/sections/reorder (accepts ordered array of section ids)
   - POST /api/sections/:sectionId/activities (assign an activity: activityId, scheduledDate — snapshot its cost)
   - DELETE /api/sections/:sectionId/activities/:sectionActivityId

4. City/Activity search (public, no auth): GET /api/cities?search=&country=, GET /api/cities/:cityId/activities?type=&category=&maxCost=

5. Itinerary View + Budget: GET /api/trips/:tripId/itinerary — nested trip → sections (ordered) → activities, each section shows its budget target vs sum(costSnapshot) actual spend, plus a top-level totalBudget vs totalSpent and a breakdown by category (TRANSPORT/STAY/ACTIVITIES/MEALS) for the pie chart. Include an `overBudget: boolean` flag per section and overall.

6. Profile: PATCH /api/users/me (update name/photo/email/language).

7. Publish + Community (build together, community reuses publish):
   - PATCH /api/trips/:tripId/publish (generates shareSlug, sets isPublic true)
   - GET /api/public/trips/:slug (no auth, read-only, 404 if not public)
   - GET /api/public/trips?search=&sort= (community feed — list of all public trips, no auth)
   - POST /api/public/trips/:slug/copy (auth required — clones the trip + its sections + section-activities into the logged-in user's own trips)

8. Admin (optional, build only if P0/P1 above are fully working): GET /api/admin/stats (trip count, top cities, top activities, user count) — auth + admin-role check.

AUTH RULES:
- All /trips, /sections, /users/me routes require JWT.
- A user can only read/write their OWN trips/sections — enforce in service layer, return 404 (not 403) if a trip belongs to someone else.
- /cities, /activities, /public/trips/* are public, no auth. /public/trips/:slug/copy requires auth (need to know whose trip list to add to).

VALIDATION: Zod schema per route, 400 with field-level errors on failure.

ERROR HANDLING: centralized middleware, consistent shape { success, message, data|errors }, correct status codes (400/401/403/404/409/500).

DELIVER: full working code for every file, no pseudocode. Include .env.example, prisma/schema.prisma with seed script, and curl/Postman examples for every endpoint in step 1–5 (the demo-critical path).

Build and confirm steps 1–5 are fully working end-to-end (register → login → create trip → add section → assign activity → fetch itinerary with correct budget math) before writing any code for steps 6–8.