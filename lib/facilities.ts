import {
  collection,
  getDocs,
  doc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Facility } from './types';

const FACILITIES_COLLECTION = 'facilities';

function docToFacility(docSnap: { id: string; data: () => Record<string, unknown> }): Facility {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    name: (data.name as string) || '',
    type: (data.type as Facility['type']) || 'Hospital',
    province: (data.province as string) || '',
    district: (data.district as string) || '',
    city: (data.city as string) || '',
    lat: (data.lat as number) || 0,
    lng: (data.lng as number) || 0,
    services: (data.services as string) || '',
    phone: (data.phone as string) || null,
    website: (data.website as string) || null,
    facebook: (data.facebook as string) || null,
    instagram: (data.instagram as string) || null,
    twitter: (data.twitter as string) || null,
    youtube: (data.youtube as string) || null,
    linkedin: (data.linkedin as string) || null,
    source: (data.source as 'osm' | 'manual') || 'manual',
    osmId: (data.osmId as string) || null,
    updatedAt: data.updatedAt instanceof Timestamp
      ? data.updatedAt.toDate()
      : new Date(),
  };
}

export async function getAllFacilities(): Promise<Facility[]> {
  const q = query(
    collection(db, FACILITIES_COLLECTION),
    orderBy('name', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToFacility);
}

export function subscribeFacilities(
  callback: (facilities: Facility[]) => void
): () => void {
  const q = query(
    collection(db, FACILITIES_COLLECTION),
    orderBy('name', 'asc')
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(docToFacility));
  });
}

export async function updateFacility(
  facilityId: string,
  fields: Partial<Facility>
): Promise<void> {
  const ref = doc(db, FACILITIES_COLLECTION, facilityId);
  await updateDoc(ref, {
    ...fields,
    updatedAt: Timestamp.now(),
  });
}
