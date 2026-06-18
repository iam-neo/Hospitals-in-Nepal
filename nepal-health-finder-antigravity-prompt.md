# Build Spec: Nepal Health Finder

You are building a production-ready web application called **Nepal Health Finder** — a map-based directory of hospitals, clinics, health posts, and pharmacies across Nepal, with contact details, social media links, and a community-driven submission/review system.

Treat this document as the full product + technical spec. Plan your work in phases (below), execute each phase fully, and verify behavior in the browser before moving to the next phase.

---

## 1. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router, TypeScript) |
| Database | Firebase Firestore |
| Auth | Firebase Authentication — Google sign-in (single admin user) |
| Hosting | Vercel |
| Map | Leaflet.js + OpenStreetMap tiles (no API key required) |
| Styling | Tailwind CSS |
| Data source for seeding | OpenStreetMap Overpass API |

Do not introduce a separate backend server (no PHP/Laravel) — Firestore + Next.js API routes/server actions cover all backend needs.

---

## 2. Data Model (Firestore)

### Collection: `facilities`
One document per health facility. Fields:

| Field | Type | Notes |
|---|---|---|
| `name` | string | required |
| `type` | string | one of: `Hospital`, `Clinic`, `Health Post`, `Pharmacy` |
| `province` | string | |
| `district` | string | |
| `city` | string | |
| `lat` | number | required |
| `lng` | number | required |
| `services` | string | short free-text description |
| `phone` | string \| null | |
| `website` | string \| null | |
| `facebook` | string \| null | full URL |
| `instagram` | string \| null | full URL |
| `twitter` | string \| null | full URL (X) |
| `youtube` | string \| null | full URL |
| `linkedin` | string \| null | full URL |
| `source` | string | `"osm"` or `"manual"` |
| `osmId` | string \| null | for de-duplication on re-import |
| `updatedAt` | timestamp | |

### Collection: `submissions`
One document per pending public suggestion. Fields:

| Field | Type | Notes |
|---|---|---|
| `facilityId` | string | reference to `facilities` doc id |
| `facilityName` | string | denormalized, for queue display |
| `fields` | map | only the fields being suggested, e.g. `{ phone: "...", facebook: "..." }` |
| `submitterName` | string \| null | optional |
| `status` | string | `"pending"` \| `"approved"` \| `"rejected"` |
| `createdAt` | timestamp | |
| `reviewedAt` | timestamp \| null | |

### Firestore Security Rules
Implement exactly this logic (public can read facilities and create submissions; only the authenticated admin can write facilities or review submissions):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /facilities/{facilityId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /submissions/{submissionId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

---

## 3. Core Features

1. **Map + directory home page (`/`)**
   - Full-height Leaflet map with OpenStreetMap tiles, centered on Nepal.
   - Sidebar list of facilities (cards), synced with map markers — clicking either highlights/pans to the other.
   - Search box (filter by name/city) and filter chips by facility type.
   - Markers color-coded by type (see design tokens below) with a legend.
   - "Use my location" button (browser geolocation) that sorts the list by distance and shows distance per card.

2. **Facility contact & social display**
   - Each card/popup shows small icon badges for whichever of phone/website/facebook/instagram/twitter/youtube/linkedin are populated. Phone opens `tel:`, others open the URL in a new tab.
   - If a facility has no contact info yet, show "No contact details yet" with a "+ Suggest update" action.
   - "+ Suggest update" is always available, even on facilities that already have some info (for corrections/additions).

3. **Public submission form**
   - Modal triggered by "+ Suggest update" on a specific facility.
   - Fields: phone, website, facebook, instagram, twitter, youtube, linkedin (all optional text inputs, URL fields should have basic format validation), submitter name (optional).
   - On submit: write a new doc to `submissions` with status `pending`. No auth required to submit.
   - Show a clear success state confirming it will be reviewed before going live.

4. **Get Directions**
   - Button on card/popup opens `https://www.google.com/maps/dir/?api=1&destination={lat},{lng}` in a new tab.

5. **Admin review queue (`/admin`, protected route)**
   - Gated behind Firebase Auth Google sign-in. Only allow a single authorized email (read from an env var `ADMIN_EMAIL`) to access — redirect anyone else to a "not authorized" state.
   - List all `submissions` with status `pending`, showing facility name, submitted fields, and submitter name.
   - Approve button: merges the submitted `fields` into the corresponding `facilities` doc (only overwrite fields that were actually submitted) and sets submission status to `approved`.
   - Reject button: sets submission status to `rejected`, no changes to facility.
   - Show a live count of pending submissions.

6. **Data seeding script**
   - A standalone Node script (`scripts/importFromOsm.ts`) using the Firebase Admin SDK that queries the Overpass API for Nepal health facilities and upserts them into `facilities` with `source: "osm"`.
   - Use this Overpass QL query as the basis (adjust as needed):
     ```
     [out:json][timeout:60];
     area["ISO3166-1"="NP"][admin_level=2]->.searchArea;
     (
       node["amenity"~"hospital|clinic|doctors|pharmacy"](area.searchArea);
       way["amenity"~"hospital|clinic|doctors|pharmacy"](area.searchArea);
       node["healthcare"](area.searchArea);
       way["healthcare"](area.searchArea);
     );
     out center tags;
     ```
   - Map OSM `amenity`/`healthcare` tags to our four `type` values (use reasonable judgment — e.g. `amenity=hospital` → `Hospital`, `amenity=pharmacy` → `Pharmacy`, `healthcare=clinic` or `amenity=clinic` → `Clinic`, anything matching a primary-care/health-post pattern → `Health Post`).
   - Use `osmId` (OSM type+id) to avoid creating duplicates on re-runs — update existing docs instead of inserting new ones when `osmId` already exists.
   - This script is run manually by the project owner (not exposed as a public-facing feature).

---

## 4. Design Direction

Match this visual language (already validated with the user via prototype):

- **Brand color (header, primary buttons):** `#1F4D43` (deep teal), hover `#2E6F61`
- **Facility type marker colors:** Hospital `#E2861B`, Clinic `#6B7F3A`, Health Post `#3A5A78`, Pharmacy `#B5533C`
- **Social icon colors:** Facebook `#1877F2`, Instagram `#C13584`, X `#111111`, YouTube `#FF0000`, LinkedIn `#0A66C2`, Phone `#3A5A78`, Website `#5B5B54`
- **Background:** soft paper white `#F7F6F2`, ink text `#1B1B18`, muted text `#6B6A62`, hairline borders `#E5E2D8`
- **Fonts:** "Space Grotesk" for headings/brand, "Inter" for body/UI text, "IBM Plex Mono" for distances/data readouts (load via Google Fonts)
- **Signature detail:** facility list cards use a "ticket stub" look — small circular notches cut into the left/right edges of each card (like a perforated permit card) — and the header has a subtle horizontal contour-line texture in the background, evoking topographic trekking maps.
- Fully responsive: on narrow viewports, stack the map above the list (map ~55% height, list ~45%, scrollable).

---

## 5. Suggested Project Structure

```
/app
  /page.tsx              → home (map + directory)
  /admin/page.tsx         → protected review queue
/components
  Map.tsx, FacilityCard.tsx, SearchFilters.tsx, SuggestModal.tsx, ReviewQueue.tsx
/lib
  firebase.ts             → Firebase client init
  firebaseAdmin.ts         → Firebase Admin SDK init (server-side only)
/scripts
  importFromOsm.ts
/firestore.rules
.env.local.example
```

---

## 6. Environment Variables

Create `.env.local.example` (placeholders only — do not commit real secrets):

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
ADMIN_EMAIL=
FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON=
```

The project owner will fill in real values locally and in Vercel's environment variable settings — do not attempt to generate or guess real Firebase credentials.

---

## 7. Build Phases

1. **Scaffold** — Next.js + TypeScript + Tailwind app, Firebase client SDK wired up, `.env.local.example` created, `firestore.rules` written.
2. **Map & directory UI** — home page with map, sidebar, search/filter, geolocation distance sort, contact icon display, directions deep link — using a small hardcoded sample dataset first to validate UI before Firestore is wired in.
3. **Connect to Firestore** — replace sample data with live `facilities` collection reads.
4. **Submission flow** — modal form writing to `submissions`.
5. **Admin auth + review queue** — Google sign-in, authorized-email gate, approve/reject logic.
6. **OSM import script** — build and test `scripts/importFromOsm.ts` against a small bounding box before running for all of Nepal.
7. **Deployment prep** — `vercel.json` if needed, confirm build passes locally (`next build`), document env vars required in a `README.md`.

---

## 8. Definition of Done (verify in-browser before considering complete)

- [ ] Map loads centered on Nepal with sample/live markers visible
- [ ] Search filters the list and map markers correctly by name/city
- [ ] Type filter chips work and update both list and map
- [ ] Clicking a list card pans the map and opens the facility's popup
- [ ] "Use my location" sorts list by distance (test with browser geolocation permission)
- [ ] Facilities with no contact info show "Suggest update" prompt; facilities with info show correct icon badges linking out correctly
- [ ] Submitting the suggestion form creates a `pending` doc in `submissions` and shows a success message
- [ ] `/admin` redirects/blocks unauthenticated or non-authorized users
- [ ] Signed-in admin sees pending submissions, and Approve correctly merges fields into the live facility doc and updates the UI
- [ ] Reject removes the item from the pending queue without altering the facility
- [ ] Layout is usable on a mobile-width viewport (map/list stack correctly)
- [ ] `next build` completes with no errors

---

## 9. Constraints

- Do not hardcode any real Firebase credentials, API keys, or the admin's actual email anywhere in committed code — use environment variables throughout.
- Do not implement real turn-by-turn routing — the directions button simply deep-links to Google Maps.
- Keep the OSM import script idempotent (safe to re-run without creating duplicates).
