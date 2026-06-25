'use client';

import { FacilityType, FACILITY_TYPES, FACILITY_TYPE_COLORS } from '@/lib/types';

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTypes: FacilityType[];
  onTypeToggle: (type: FacilityType) => void;
  locationActive: boolean;
  onToggleLocation: () => void;
  locationLoading: boolean;
}

export default function SearchFilters({
  searchQuery,
  onSearchChange,
  activeTypes,
  onTypeToggle,
  locationActive,
  onToggleLocation,
  locationLoading,
}: SearchFiltersProps) {
  return (
    <div>
      {/* Search Input */}
      <div className="search-input-wrapper">
        <svg
          className="search-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          id="search-input"
          type="text"
          className="search-input"
          placeholder="Search by name or city..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Filter chips + location button */}
      <div className="filter-chips">
        {FACILITY_TYPES.map((type) => {
          const color = FACILITY_TYPE_COLORS[type];
          const isActive = activeTypes.includes(type);
          return (
            <button
              key={type}
              className={`filter-chip${isActive ? ' active' : ''}`}
              style={{
                borderColor: color,
                color: isActive ? '#FFFFFF' : color,
                backgroundColor: isActive ? color : 'transparent',
              }}
              onClick={() => onTypeToggle(type)}
            >
              {type}
            </button>
          );
        })}

        <button
          className={`location-btn${locationActive ? ' active' : ''}`}
          onClick={onToggleLocation}
          disabled={locationLoading}
        >
          {locationLoading ? (
            <>
              <span className="spinner" style={{ width: 14, height: 14, marginRight: 0, borderWidth: 2 }} />
              Locating...
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
              </svg>
              {locationActive ? 'Near me ✓' : 'Use my location'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
