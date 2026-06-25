'use client';

import React from 'react';
import { Facility, FACILITY_TYPE_COLORS, CONTACT_FIELDS } from '@/lib/types';

interface FacilityCardProps {
  facility: Facility;
  isActive: boolean;
  distance: number | null;
  onClick: () => void;
  onSuggestUpdate: () => void;
}

const SOCIAL_ICON_STYLES: Record<string, { bg: string; color: string }> = {
  phone: { bg: 'rgba(58,90,120,0.12)', color: '#3A5A78' },
  website: { bg: 'rgba(91,91,84,0.12)', color: '#5B5B54' },
  facebook: { bg: 'rgba(24,119,242,0.12)', color: '#1877F2' },
  instagram: { bg: 'rgba(193,53,132,0.12)', color: '#C13584' },
  twitter: { bg: 'rgba(17,17,17,0.08)', color: '#111111' },
  youtube: { bg: 'rgba(255,0,0,0.1)', color: '#FF0000' },
  linkedin: { bg: 'rgba(10,102,194,0.12)', color: '#0A66C2' },
};

const SOCIAL_ICONS: Record<string, React.JSX.Element> = {
  phone: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
    </svg>
  ),
  website: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
};

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

export default function FacilityCard({
  facility,
  isActive,
  distance,
  onClick,
  onSuggestUpdate,
}: FacilityCardProps) {
  const typeColor = FACILITY_TYPE_COLORS[facility.type];
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lng}`;

  const hasContact = CONTACT_FIELDS.some(
    (field) => facility[field] !== null && facility[field] !== ''
  );

  return (
    <div
      className={`facility-card${isActive ? ' active' : ''}`}
      onClick={onClick}
      id={`facility-${facility.id}`}
    >
      <div className="card-header">
        <h3 className="card-name">{facility.name}</h3>
        <span className="card-type-badge" style={{ backgroundColor: typeColor }}>
          {facility.type}
        </span>
      </div>

      <div className="card-location">
        {facility.city}
        {facility.district ? `, ${facility.district}` : ''}
        {facility.province ? ` · ${facility.province}` : ''}
      </div>

      {facility.services && (
        <div className="card-services">{facility.services}</div>
      )}

      <div className="card-footer">
        <div className="card-social-icons">
          {hasContact ? (
            CONTACT_FIELDS.map((field) => {
              const value = facility[field];
              if (!value) return null;

              const style = SOCIAL_ICON_STYLES[field];
              const href =
                field === 'phone' ? `tel:${value}` : value;
              const target = field === 'phone' ? undefined : '_blank';

              return (
                <a
                  key={field}
                  href={href}
                  target={target}
                  rel={target ? 'noopener noreferrer' : undefined}
                  className="social-icon-btn"
                  style={{ background: style.bg, color: style.color }}
                  title={field.charAt(0).toUpperCase() + field.slice(1)}
                  onClick={(e) => e.stopPropagation()}
                >
                  {SOCIAL_ICONS[field]}
                </a>
              );
            })
          ) : (
            <span className="card-no-contact">No contact info yet</span>
          )}
        </div>

        <div className="card-actions">
          {distance !== null && (
            <span className="card-distance">{formatDistance(distance)}</span>
          )}
          <button
            className="btn btn-ghost btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              onSuggestUpdate();
            }}
            title="Suggest contact info update"
          >
            + Suggest
          </button>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.71 11.29l-9-9a.996.996 0 00-1.41 0l-9 9a.996.996 0 000 1.41l9 9c.39.39 1.02.39 1.41 0l9-9a.996.996 0 000-1.41zM14 14.5V12h-4v3H8v-4c0-.55.45-1 1-1h5V7.5l3.5 3.5-3.5 3.5z" />
            </svg>
            Directions
          </a>
        </div>
      </div>
    </div>
  );
}
