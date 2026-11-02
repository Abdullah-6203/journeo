# JOURNEO — Personalized AI Travel Planning Platform

> *"Travel at your own pace. Discover places that match your interests. Let Journeo plan the journey."*

Journeo is a full-stack, personalized travel planning and adaptive replanning web application designed for exploring cultural and royal heritage in India (Delhi, Jaipur, Agra, Varanasi, Udaipur, Hampi).

---

## 🏛️ System Architecture

### Frontend
- **Framework:** React 18, Vite, TypeScript
- **Styling:** Tailwind CSS (Warm Ivory `#F7F4EA`, Deep Green `#344B38`, Sage Green `#87977B`, Terracotta `#C87950`)
- **Typography:** *Playfair Display* (Editorial headings) + *Inter* (UI/Body)
- **Routing:** React Router v6
- **Maps:** Leaflet & Google Maps JS API Layer with verified ASI/UNESCO coordinates
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js REST API
- **Database:** Prisma ORM with SQLite (`dev.db` for zero-config local run) & seamless PostgreSQL switch
- **Authentication:** JWT + bcryptjs password hashing
- **Algorithms:**
  - **Constraint-Aware Itinerary Optimizer:** Greedy nearest-neighbor route heuristic with dwell times and opening hours
  - **Adaptive Replanner:** Real-time delay detector & threat analysis generating 3 recovery strategies

---

## 🚀 Running the Prototype Locally

### 1. Backend Server
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
node prisma/seed.js
node src/server.js
```
*Backend runs on:* `http://localhost:5000`  
*Health Check:* `http://localhost:5000/api/health`

### 2. Frontend Development Server
```bash
# In project root
npm install
npm run dev
```
*Frontend runs on:* `http://localhost:5173`

---

## 🔑 Demo Account Credentials
- **Email:** `demo@journeo.com`
- **Password:** `Password123!`

---

## 🗺️ Key Features Implemented

1. **Editorial Landing Page:**
   - Cinematic hero section with floating interactive itinerary preview card
   - 4-step *How Journeo Works* visual breakdown
   - Popular Destinations catalogue (Delhi, Jaipur, Agra, Varanasi, Udaipur, Hampi)
   - *Why Choose Journeo* value proposition cards
   - Full sample itinerary showcase

2. **3-Step Trip Planning Workflow (`/plan`):**
   - **Step 1:** Multi-select travel interests, travel pace selector (*Relaxed*, *Balanced*, *Packed*), and optional natural-language AI prompt.
   - **Step 2:** Trip logistics (city, start origin, date, available hours, group size, budget, transport mode).
   - **Step 3:** Curated destination picker with live map pins and Must-Visit priority toggles.

3. **Split-Screen Itinerary Results (`/itinerary/preview`):**
   - **Left:** Ordered timeline with dwell times, arrival/departure clocks, and duration adjustment controls.
   - **Right:** Interactive geographic route map with numbered terracotta markers and polyline connections.
   - **Actions:** Save Trip, Start Journey Mode, Simulate 45m Delay.

4. **Adaptive Delay Replanning (Section 9):**
   - Simulates downstream gate closure threats when delayed at a monument.
   - Evaluates and offers 3 distinct AI adaptation strategies:
     1. *Prioritize Must-Visits & UNESCO Landmarks*
     2. *Compress Dwell Times & Focus on Highlights*
     3. *Twilight Sunset Viewpoint Transition*
   - One-click strategy apply updates the live timetable and map.

5. **Journey Mode (`/journey`):**
   - Active monument check-in (*Mark as Visited*, *Skip Stop*).
   - Live progress bar tracking completed vs. remaining sites.
   - Direct navigation links to Google Maps.

6. **Destination Detail Pages (`/destinations/:id`):**
   - High-resolution photography, entry fees, operating hours.
   - Dedicated *"Discover Its Story"* section with ASI & UNESCO historical citations.
   - Nearby similar destinations recommendations.

7. **My Trips Dashboard (`/my-trips`):**
   - Categorized tabs: *Upcoming Trips*, *Ongoing Journey*, *Completed Journeys*.
   - Reopen saved itineraries, edit durations, or delete trips.