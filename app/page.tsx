'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Facility, FacilityType } from '@/lib/types';
import { sampleFacilities } from '@/lib/sampleData';
import FacilityCard from '@/components/FacilityCard';
import SearchFilters from '@/components/SearchFilters';
import SuggestModal from '@/components/SuggestModal';

// Dynamic import for Leaflet (requires browser APIs)
const MapComponent = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="map-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#E8E6E0' }}>
      <div className="loading-container">
        <span className="spinner" />
        Loading map...
      </div>
    </div>
  ),
});

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Set to true once Firestore is configured with real data
const USE_FIRESTORE = false;

export default function HomePage() {
  const [facilities, setFacilities] = useState<Facility[]>(sampleFacilities);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [suggestFacility, setSuggestFacility] = useState<Facility | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTypes, setActiveTypes] = useState<FacilityType[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [firestoreLoading, setFirestoreLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Firestore integration (activate when ready)
  useEffect(() => {
    if (!USE_FIRESTORE) return;
    setFirestoreLoading(true);

    import('@/lib/facilities').then(({ subscribeFacilities }) => {
      const unsubscribe = subscribeFacilities((facs) => {
        setFacilities(facs);
        setFirestoreLoading(false);
      });
      return () => unsubscribe();
    });
  }, []);

  // Filter and sort facilities
  const filteredFacilities = useMemo(() => {
    let result = facilities;

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.city.toLowerCase().includes(q) ||
          f.district.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (activeTypes.length > 0) {
      result = result.filter((f) => activeTypes.includes(f.type));
    }

    // Distance sort
    if (userLocation) {
      result = [...result].sort((a, b) => {
        const da = haversineDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
        const db = haversineDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
        return da - db;
      });
    }

    return result;
  }, [facilities, searchQuery, activeTypes, userLocation]);

  const getDistance = useCallback(
    (facility: Facility): number | null => {
      if (!userLocation) return null;
      return haversineDistance(
        userLocation.lat,
        userLocation.lng,
        facility.lat,
        facility.lng
      );
    },
    [userLocation]
  );

  const handleTypeToggle = useCallback((type: FacilityType) => {
    setActiveTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, []);

  const handleToggleLocation = useCallback(() => {
    if (userLocation) {
      setUserLocation(null);
      return;
    }

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert(
          'Could not get your location. Please ensure location access is enabled.'
        );
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [userLocation]);

  const handleSelectFacility = useCallback((facility: Facility) => {
    setSelectedFacility(facility);

    // Scroll the card into view in the sidebar
    setTimeout(() => {
      const cardEl = document.getElementById(`facility-${facility.id}`);
      if (cardEl && listRef.current) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  }, []);

  const handleSuggestUpdate = useCallback((facility: Facility) => {
    setSuggestFacility(facility);
  }, []);

  if (firestoreLoading) {
    return (
      <div className="main-layout">
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="loading-container">
            <span className="spinner" />
            Loading facilities...
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="main-layout">
        {/* Map */}
        <MapComponent
          facilities={filteredFacilities}
          selectedFacility={selectedFacility}
          onSelectFacility={handleSelectFacility}
          onSuggestUpdate={handleSuggestUpdate}
        />

        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <SearchFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeTypes={activeTypes}
              onTypeToggle={handleTypeToggle}
              locationActive={!!userLocation}
              onToggleLocation={handleToggleLocation}
              locationLoading={locationLoading}
            />
            <div className="sidebar-results">
              {filteredFacilities.length} facilit{filteredFacilities.length === 1 ? 'y' : 'ies'} found
              {userLocation && ' · sorted by distance'}
            </div>
          </div>

          <div className="sidebar-list" ref={listRef}>
            {filteredFacilities.length === 0 ? (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
                <h3>No facilities found</h3>
                <p>Try adjusting your search or filters.</p>
              </div>
            ) : (
              filteredFacilities.map((facility) => (
                <FacilityCard
                  key={facility.id}
                  facility={facility}
                  isActive={selectedFacility?.id === facility.id}
                  distance={getDistance(facility)}
                  onClick={() => handleSelectFacility(facility)}
                  onSuggestUpdate={() => handleSuggestUpdate(facility)}
                />
              ))
            )}
          </div>
        </aside>
      </div>

      {/* Suggest Modal */}
      {suggestFacility && (
        <SuggestModal
          facility={suggestFacility}
          onClose={() => setSuggestFacility(null)}
          useFirestore={USE_FIRESTORE}
        />
      )}
    </>
  );
}
