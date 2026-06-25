# Nepal Health Finder

A map-based directory of hospitals, clinics, health posts, and pharmacies across Nepal. Find nearby health facilities, get directions, and access contact information.

## Features

- **Interactive Map** — Leaflet map with color-coded markers for each facility type
- **Searchable Directory** — Filter by name, city, or facility type
- **Geolocation** — "Use my location" to sort facilities by distance
- **Contact & Social Layer** — Phone, website, Facebook, Instagram, X, YouTube, LinkedIn links
- **Community Submissions** — Anyone can suggest contact info; admin reviews before publishing
- **Admin Review Queue** — Google sign-in gated dashboard to approve/reject submissions
- **OSM Data Seeding** — Import facility data from OpenStreetMap via Overpass API

## Tech Stack

| Layer      | Technology                              |
| ---------- | --------------------------------------- |
| Framework  | Next.js 16 (App Router, TypeScript)     |
| Styling    | Tailwind CSS v4 + custom CSS            |
| Map        | Leaflet.js + OpenStreetMap tiles        |
| Database   | Firebase Firestore                      |
| Auth       | Firebase Authentication (Google)        |
| Hosting    | Vercel                                  |
| Data seed  | OpenStreetMap Overpass API              |

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Firebase project with Firestore and Authentication enabled

### Setup

1. **Clone and install:**
   ```bash
   git clone <repo-url>
   cd HIN
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in your Firebase config values in `.env.local`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_ADMIN_EMAIL` — your Google account email
   - `FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON` — full JSON string of your Firebase service account key

3. **Deploy Firestore security rules:**
   Copy the contents of `firestore.rules` into your Firebase Console → Firestore → Rules.

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

### Activating Firestore

The app starts with sample data by default. To switch to live Firestore data:

1. Open `app/page.tsx`
2. Change `const USE_FIRESTORE = false;` to `const USE_FIRESTORE = true;`

### Seeding Data from OpenStreetMap

The import script queries the Overpass API for health facilities in Nepal and writes them to Firestore:

```bash
# Preview what will be imported (no writes)
npm run seed -- --dry-run

# Run the actual import
npm run seed
```

The script is idempotent — re-running it updates existing facilities (matched by OSM ID) rather than creating duplicates.

## Deployment

### Vercel

1. Push the repo to GitHub
2. Import the project in Vercel
3. Add all environment variables in Vercel's project settings
4. Deploy — Vercel auto-detects Next.js

## Project Structure

```
app/
  layout.tsx          → Root layout (fonts, header, nav)
  page.tsx            → Home page (map + directory)
  globals.css         → Design system & tokens
  admin/page.tsx      → Protected admin review queue

components/
  Map.tsx             → Leaflet map with markers & popups
  FacilityCard.tsx    → Ticket-stub facility card
  SearchFilters.tsx   → Search input + type chips + location
  SuggestModal.tsx    → Contact info submission form
  ReviewQueue.tsx     → Admin submission review list

lib/
  firebase.ts         → Firebase client SDK init
  firebaseAdmin.ts    → Firebase Admin SDK init (server-side)
  types.ts            → TypeScript types & design tokens
  sampleData.ts       → Sample facilities for development
  facilities.ts       → Firestore read/write for facilities
  submissions.ts      → Firestore CRUD for submissions
  auth.ts             → Auth hook with admin check

scripts/
  importFromOsm.ts    → OSM Overpass API data seeder

firestore.rules       → Firestore security rules
```

## License

MIT
