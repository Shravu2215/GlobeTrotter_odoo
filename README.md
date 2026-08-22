# GlobeTrotter
### Discover · Plan · Experience

Built for the Odoo Hackathon by **Team SuperNova** — Shravani, Tanishka, Devyani, Minal
(PCCOER, Pune)

GlobeTrotter is a multi-city travel planning platform. Pick your cities, build a
day-by-day itinerary, track cost against budget, and browse trips other travelers have
shared — all from one place.

---

## Screens

### 🔐 Login / Sign Up
Clean, centered auth card under the GlobeTrotter wordmark and tagline. Email + password
sign-in, with a Sign Up link for new users.

### 🏠 Home
Full-width hero ("Explore the World") with a destination search bar (Group by / Filter /
Sort by), followed by a **Top Regional Selections** card grid of popular destinations. A
floating **"Plan a trip"** button is always accessible from the corner.

### 🧳 My Trips
Trip dashboard with tabbed filters — **All / Ongoing / Upcoming / Completed** — each
showing a live count. Search and sort (Newest first) built in. Empty state guides new
users straight into trip creation with a **Create a Trip** button.

### 🧭 Explore (City / Activity Search)
Search cities or activities directly (e.g. *Paragliding, Paris, Tokyo, Museum*), with
quick-tap popular tags and Group by / Filter / Sort by controls. An **Active Planning
Session** banner tracks whichever trip you're currently building (e.g. *"europe (Paris,
France)"*) with a one-click **Open Builder** shortcut. Results show as rich cards —
name, category tag, rating, location, duration, price — with **View Details** and **Add
to Trip** actions on every card.

### 🗺️ View Itinerary
The full multi-city trip laid out day by day. Header shows the trip name, date range,
and full route (e.g. *Paris, France → Interlaken, Switzerland → Rome, Italy*), with
quick-glance stats for trip duration, number of destinations, and total planned
activities. A category filter bar (Sightseeing / Museum / Food / Historical / Adventure
/ Nature) narrows the view instantly. Each day is broken into a timeline of activity
cards — image, time slot, duration, category tag, opening hours, and price — with a
running **Day's Activity Cost** total per day, and a **View Cost Breakdown** shortcut
into the Budget screen.

### 💰 Budget Breakdown
A full financial view of the trip. An alert banner flags when the estimated total
exceeds the trip budget (e.g. *"Exceeds Budget by ₹73,500"*), paired with an **AI Smart
Auto-Adjustment** action that rebalances stays and transit across cities to bring the
plan back within budget. Below that: a four-category cost summary (Stay, Transport,
Activities, Meals) each with its ₹ total, share of spend, and a one-line source note; a
**Budget Distribution** donut chart across all cities combined; and side-by-side stats
for target daily budget, average daily spend, and days that went over budget. A
**Daily Schedule & Overbudget Alerts** list flags exactly which days exceeded their
limit and by how much.

### 📅 Calendar (Itinerary Calendar)
Month-grid view of the active trip, with days that have planned activities visually
marked. Selecting a day opens a **Day Schedule** panel listing every activity for that
date — time, location, category tag, and cost — plus a running **Daily Estimated Cost**
total. An **Edit in Builder** shortcut jumps back into itinerary editing.

### 🌍 Community (Discover Itineraries)
Public feed of itineraries shared by other travelers, with headline stats (shared trips,
countries covered, total activities). Each itinerary card shows the destination, country
code, title, and a short description, searchable and sortable (Newest First).

---

## Design

- Serif display type (trip titles, hero text) paired with clean sans-serif UI text
- Deep green + gold accent palette (`SIGN IN` / `Plan a trip` buttons in forest green,
  gold used for links and highlights)
- Card-based layout throughout — trips, activities, budget categories, and community
  itineraries all use a consistent rounded-card pattern
- Persistent top navigation across every screen: **Home · My Trips · Explore · Calendar
  · Community**, with notifications and profile (name + avatar) always accessible
  top-right

---

## Tech Stack

**Frontend**
- React (Vite) + TypeScript
- Tailwind CSS
- React Router
- Context / Zustand for auth + active trip state
- Charting for the Budget Distribution donut chart

**Backend**
- Node.js + Express.js + TypeScript
- PostgreSQL + Prisma ORM
- JWT authentication + bcrypt
- Zod validation, Helmet, CORS, express-rate-limit

**Currency & locale**
- Pricing displayed in ₹ (INR)

---

## Core Features

| Feature | Where it shows up |
|---|---|
| Auth (login/signup, persistent session) | Login screen → redirects into the app |
| Destination discovery | Home hero search + Top Regional Selections |
| City & activity search with filters | Explore screen |
| Itinerary Builder | Reached via "Open Builder" from an active planning session |
| Multi-city day-by-day itinerary | View Itinerary screen, filterable by category |
| Budget tracking with category breakdown | Budget screen — Stay/Transport/Activities/Meals split, donut chart |
| Over-budget detection & alerts | Budget screen — top banner + per-day alert list |
| AI-assisted budget rebalancing | Budget screen — "Apply AI Smart Auto-Adjustment" |
| Day-wise cost tracking in calendar form | Calendar screen, per-day schedule + daily estimated cost |
| Trip management | My Trips — All/Ongoing/Upcoming/Completed, search, sort |
| Public itinerary sharing & discovery | Community feed |

---

## Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_BASE_URL=http://localhost:5000/api
npm run dev             # runs on localhost:5173
```

---

## Team SuperNova

Shravani · Tanishka · Devyani · Minal
Pimpri Chinchwad College of Engineering and Research (PCCOER), Pune
