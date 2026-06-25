/**
 * OSM Import Script for Nepal Health Finder
 *
 * Queries the Overpass API for health facilities in Nepal
 * and upserts them into Firestore using osmId for deduplication.
 *
 * Usage:
 *   npm run seed
 *   npm run seed -- --dry-run   (preview without writing to Firestore)
 *
 * Prerequisites:
 *   - FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON env var must be set
 */

import { adminDb } from '../lib/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

const OVERPASS_QUERY = `
[out:json][timeout:120];
area["ISO3166-1"="NP"][admin_level=2]->.searchArea;
(
  node["amenity"~"hospital|clinic|doctors|pharmacy"](area.searchArea);
  way["amenity"~"hospital|clinic|doctors|pharmacy"](area.searchArea);
  node["healthcare"](area.searchArea);
  way["healthcare"](area.searchArea);
);
out center tags;
`;

function mapToFacilityType(tags: Record<string, string>): string {
  const amenity = tags.amenity?.toLowerCase();
  const healthcare = tags.healthcare?.toLowerCase();

  if (amenity === 'hospital' || healthcare === 'hospital') return 'Hospital';
  if (amenity === 'pharmacy' || healthcare === 'pharmacy') return 'Pharmacy';
  if (
    amenity === 'clinic' ||
    amenity === 'doctors' ||
    healthcare === 'clinic' ||
    healthcare === 'doctor'
  ) {
    return 'Clinic';
  }
  if (
    healthcare === 'health_post' ||
    healthcare === 'health_centre' ||
    healthcare === 'centre' ||
    healthcare === 'birthing_centre' ||
    healthcare === 'community_health_centre'
  ) {
    return 'Health Post';
  }

  // Default: if it has a healthcare tag but doesn't match above
  if (healthcare) return 'Health Post';

  return 'Clinic';
}

function extractName(tags: Record<string, string>): string {
  return (
    tags['name:en'] ||
    tags.name ||
    tags['alt_name'] ||
    'Unnamed Facility'
  );
}

function extractLocation(element: OverpassElement): { lat: number; lng: number } | null {
  if (element.lat !== undefined && element.lon !== undefined) {
    return { lat: element.lat, lng: element.lon };
  }
  if (element.center) {
    return { lat: element.center.lat, lng: element.center.lon };
  }
  return null;
}

async function fetchFromOverpass(): Promise<OverpassElement[]> {
  console.log('🌐 Querying Overpass API...');
  const response = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(OVERPASS_QUERY)}`,
  });

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as OverpassResponse;
  console.log(`📦 Received ${data.elements.length} elements from Overpass`);
  return data.elements;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  if (dryRun) {
    console.log('🏜️  DRY RUN — no data will be written to Firestore\n');
  }

  // Fetch from Overpass
  const elements = await fetchFromOverpass();

  // Build existing osmId index for dedup
  console.log('📚 Fetching existing facilities from Firestore...');
  const existingSnapshot = await adminDb.collection('facilities').get();
  const osmIdToDocId = new Map<string, string>();
  existingSnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.osmId) {
      osmIdToDocId.set(data.osmId, doc.id);
    }
  });
  console.log(`📋 Found ${existingSnapshot.size} existing facilities (${osmIdToDocId.size} with osmId)\n`);

  // Process elements
  let created = 0;
  let updated = 0;
  let skipped = 0;
  const batchSize = 500;
  let batch = adminDb.batch();
  let batchCount = 0;

  for (const element of elements) {
    const tags = element.tags || {};
    const location = extractLocation(element);

    if (!location) {
      skipped++;
      continue;
    }

    const osmId = `${element.type}/${element.id}`;
    const name = extractName(tags);
    const type = mapToFacilityType(tags);

    const facilityData = {
      name,
      type,
      province: tags['addr:state'] || tags['addr:province'] || '',
      district: tags['addr:district'] || '',
      city:
        tags['addr:city'] ||
        tags['addr:town'] ||
        tags['addr:village'] ||
        tags['addr:hamlet'] ||
        '',
      lat: location.lat,
      lng: location.lng,
      services: tags.description || tags.healthcare_speciality || tags['health_speciality:en'] || '',
      phone: tags.phone || tags['contact:phone'] || null,
      website: tags.website || tags['contact:website'] || null,
      facebook: tags['contact:facebook'] || null,
      instagram: tags['contact:instagram'] || null,
      twitter: tags['contact:twitter'] || null,
      youtube: tags['contact:youtube'] || null,
      linkedin: tags['contact:linkedin'] || null,
      source: 'osm' as const,
      osmId,
      updatedAt: Timestamp.now(),
    };

    if (!dryRun) {
      const existingDocId = osmIdToDocId.get(osmId);
      if (existingDocId) {
        // Update existing doc (don't overwrite contact fields that may have been manually added)
        const ref = adminDb.collection('facilities').doc(existingDocId);
        batch.update(ref, {
          name: facilityData.name,
          type: facilityData.type,
          province: facilityData.province,
          district: facilityData.district,
          city: facilityData.city,
          lat: facilityData.lat,
          lng: facilityData.lng,
          services: facilityData.services,
          source: facilityData.source,
          osmId: facilityData.osmId,
          updatedAt: facilityData.updatedAt,
        });
        updated++;
      } else {
        // Create new doc
        const ref = adminDb.collection('facilities').doc();
        batch.set(ref, facilityData);
        created++;
      }

      batchCount++;
      if (batchCount >= batchSize) {
        console.log(`💾 Committing batch (${batchCount} operations)...`);
        await batch.commit();
        batch = adminDb.batch();
        batchCount = 0;
      }
    } else {
      if (osmIdToDocId.has(osmId)) {
        updated++;
      } else {
        created++;
      }
    }
  }

  // Commit remaining
  if (!dryRun && batchCount > 0) {
    console.log(`💾 Committing final batch (${batchCount} operations)...`);
    await batch.commit();
  }

  console.log('\n✅ Import complete!');
  console.log(`   Created: ${created}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped (no coordinates): ${skipped}`);
  console.log(`   Total processed: ${elements.length}`);
}

main().catch((err) => {
  console.error('❌ Import failed:', err);
  process.exit(1);
});
