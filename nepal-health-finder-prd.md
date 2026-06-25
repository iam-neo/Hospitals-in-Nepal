# Product Requirements Document: Nepal Health Finder

| | |
|---|---|
| **Author** | Nirmal "Neo" Rokamagar |
| **Status** | Draft — v1 |
| **Last updated** | June 25, 2026 |
| **Target platform** | Web (responsive) |

---

## 1. Overview

Nepal Health Finder is a map-based, public-facing directory of health facilities — hospitals, clinics, health posts, and pharmacies — across Nepal. Beyond location, it surfaces contact details and social media presence (Facebook, Instagram, X, YouTube, LinkedIn, website) for each facility, and lets the public submit corrections or additions to that contact information, which are reviewed and approved by an admin before going live.

The official government tool for this (NHFR — Nepal Health Facility Registry) exists but is limited to a visualization portal with no contact/social layer and no public contribution mechanism. This project aims to be the faster, more complete, more usable alternative — particularly useful for people trying to quickly find and actually reach a nearby facility, not just locate it on a map.

## 2. Problem Statement

When someone in Nepal needs to find a nearby hospital, clinic, or health post, the existing options are fragmented: government registries are visualization-only with no contact/social info, and informal sources (word of mouth, scattered Facebook pages) are inconsistent and hard to discover. There's no single, reliable place to find a facility's location, get directions, and immediately reach them via phone or social media.

## 3. Goals

- **Primary:** Let anyone in Nepal find the nearest relevant health facility and get there or contact it, in under a minute.
- **Secondary:** Build a community-maintained layer of contact/social data that's more complete and current than any existing government source, by combining open geographic data (OpenStreetMap) with public-submitted enrichment, moderated by a trusted admin.
- **Tertiary (longer-term):** Establish a useful, real piece of civic infrastructure that can double as a portfolio/credibility piece and potentially a foundation for outreach work with the facilities themselves (a natural extension of Neo's existing social media management work).

### Success metrics (initial, directional — not committed targets)
| Metric | Why it matters |
|---|---|
| Number of facilities with at least one contact/social field populated | Measures how much the directory layer (vs. just the map) is actually useful |
| Number of public submissions received | Signals real usage and community interest |
| Submission approval rate | Signals submission quality / need for spam controls |
| Map searches/filters per session (if analytics added later) | Signals engagement depth |

## 4. Target Users

- **Primary:** General public in Nepal searching for a nearby health facility — urban and rural, varying levels of digital literacy, often on mobile.
- **Secondary:** Facility staff or community members who want to add/correct their facility's contact or social info.
- **Admin (single user, v1):** Neo — reviews and approves/rejects submissions.

## 5. Scope

### In scope (v1)
- Map + searchable/filterable directory of facilities (Hospital, Clinic, Health Post, Pharmacy)
- Facility cards/popups showing type, location, services, and any available contact/social info
- "Get Directions" deep link to Google Maps
- "Use my location" with distance sorting
- Public submission form for contact/social details (no login required to submit)
- Admin review queue (Google sign-in, single authorized admin) to approve/reject submissions
- Initial data seeded from OpenStreetMap (Overpass API)
- Responsive (mobile + desktop)

### Out of scope (v1) — explicitly deferred
- In-app turn-by-turn routing (v1 deep-links to Google Maps instead)
- Facility "claim your listing" self-service accounts for facility owners
- Multiple admins / role-based permissions
- Ratings, reviews, or user-generated content beyond contact info
- Native mobile app (web-responsive only)
- Real-time facility status (open/closed, bed availability, etc.)
- Multi-language support (Nepali-language UI)
- Analytics/usage dashboards

### Candidate for future versions
- Facility self-claim & self-edit flow (with verification)
- Nepali-language UI
- Bed/resource availability indicators (would require facility cooperation — a much bigger undertaking)
- Push notifications for nearby emergency services
- Public API for the dataset

## 6. Functional Requirements

### 6.1 Map & Directory (home page)
- FR1: Display all facilities as map markers, color-coded by type, with a legend.
- FR2: Provide a synchronized list view — selecting an item in either the map or list highlights/updates the other.
- FR3: Support text search (name, city) and type filter chips.
- FR4: Support "use my location" to sort the list by distance and display per-facility distance.
- FR5: Each facility card/popup must show: name, type, city/province, services description, and a directions button.

### 6.2 Contact & Social Layer
- FR6: Display available contact/social info as icon links (phone → `tel:`, others → external URL in new tab).
- FR7: If no contact info exists for a facility, display a clear call-to-action to suggest it.
- FR8: "Suggest update" must be available on every facility, regardless of how complete its profile already is (for corrections, not just first-time additions).

### 6.3 Public Submission
- FR9: Anyone can submit a suggestion for a specific facility without creating an account.
- FR10: Submission form fields: phone, website, Facebook, Instagram, X, YouTube, LinkedIn (all optional, at least one required to submit), and an optional submitter name.
- FR11: Submissions are stored as `pending` and must not affect the live facility data until approved.
- FR12: User receives a clear confirmation that their submission is pending review.

### 6.4 Admin Review
- FR13: Review queue is accessible only to a single authorized Google account (via Firebase Auth).
- FR14: Admin can view all pending submissions with submitted fields and submitter name.
- FR15: Approving a submission merges only the submitted fields into the live facility record.
- FR16: Rejecting a submission discards it without altering the facility.
- FR17: Unauthenticated or unauthorized users attempting to access the review queue must be blocked.

### 6.5 Data Sourcing
- FR18: Initial facility data (name, type, location) is seeded from OpenStreetMap's Overpass API.
- FR19: The seeding process must be re-runnable without creating duplicate records (matched by OSM ID).

## 7. Non-Functional Requirements

- **Performance:** Map and list should load and become interactive within a few seconds on a typical mobile connection in Nepal (assume variable, sometimes slow, network conditions).
- **Accessibility/usability:** Must be usable by people with varying digital literacy — clear icons, minimal jargon, large enough tap targets on mobile.
- **Security:** Public write access limited strictly to the submissions queue; all facility data writes require admin authentication, enforced via Firestore security rules (not just UI-level restrictions).
- **Reliability:** No single point of failure that takes down read access to the directory (Firestore reads should remain available even if the admin/auth layer has issues).
- **Cost:** Should run within Firebase's free (Spark) tier and Vercel's free tier at current expected usage levels.

## 8. Technical Approach (summary — full detail in build spec)

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router, TypeScript), Tailwind CSS |
| Map | Leaflet.js + OpenStreetMap tiles |
| Database | Firebase Firestore |
| Auth | Firebase Authentication (Google sign-in, single admin) |
| Hosting | Vercel |
| Data seeding | OpenStreetMap Overpass API via a Node import script |

(See the separate build-spec document for full data model, security rules, and phased implementation plan.)

## 9. Risks & Assumptions

| Risk/Assumption | Notes |
|---|---|
| OSM coverage of Nepal health facilities may be incomplete or inconsistent in quality | Some facilities may be missing, mislabeled, or have outdated locations; the submission system partially mitigates this for contact info but not for missing/wrong facilities themselves |
| Single-admin review queue doesn't scale | Fine for v1; if submission volume grows, will need either more reviewers or lighter-touch moderation |
| Public submission form could attract spam or low-quality entries | No identity verification in v1 beyond an optional name field; admin review is the only gate — monitor and add basic validation/rate-limiting if abused |
| Firestore free tier limits | Should be sufficient at expected v1 scale; revisit if usage grows significantly |
| Users' trust in directions/contact accuracy | Since data is community-sourced and admin-reviewed rather than officially verified, the app should avoid implying official/government endorsement |

## 10. Milestones

1. Prototype validated (✅ done — interactive HTML/Leaflet mockup with sample data)
2. Firebase project set up (Firestore, Auth, security rules)
3. Next.js app scaffolded with map/directory UI (sample data)
4. Firestore integration replacing sample data
5. Public submission flow live
6. Admin review queue live
7. OSM import script run for full Nepal dataset
8. Deployed to Vercel, end-to-end tested
9. Soft launch / share for initial feedback

## 11. Open Questions

- Should there be any rate-limiting or basic spam protection (e.g. simple CAPTCHA) on the public submission form before wider release?
- Should approved submissions overwrite existing fields outright, or should the admin see a "current vs. suggested" diff when a field already has a value?
- At what point (if any) does this need a second admin/reviewer?
