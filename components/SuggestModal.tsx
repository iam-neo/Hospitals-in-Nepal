'use client';

import React, { useState } from 'react';
import { Facility, CONTACT_FIELDS, ContactField, SubmissionFields } from '@/lib/types';
import { createSubmission } from '@/lib/submissions';

interface SuggestModalProps {
  facility: Facility;
  onClose: () => void;
  useFirestore: boolean;
}

const FIELD_LABELS: Record<ContactField, string> = {
  phone: 'Phone Number',
  website: 'Website',
  facebook: 'Facebook',
  instagram: 'Instagram',
  twitter: 'X (Twitter)',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
};

const FIELD_PLACEHOLDERS: Record<ContactField, string> = {
  phone: '+977-1-4412303',
  website: 'https://example.com',
  facebook: 'https://facebook.com/...',
  instagram: 'https://instagram.com/...',
  twitter: 'https://x.com/...',
  youtube: 'https://youtube.com/@...',
  linkedin: 'https://linkedin.com/company/...',
};

const FIELD_ICONS: Record<ContactField, React.JSX.Element> = {
  phone: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#3A5A78">
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
    </svg>
  ),
  website: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#5B5B54">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
  ),
  facebook: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  ),
  instagram: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#C13584">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
  twitter: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#111">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  youtube: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF0000">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  linkedin: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#0A66C2">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
};

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export default function SuggestModal({
  facility,
  onClose,
  useFirestore,
}: SuggestModalProps) {
  const [values, setValues] = useState<Record<ContactField, string>>(
    Object.fromEntries(CONTACT_FIELDS.map((f) => [f, ''])) as Record<
      ContactField,
      string
    >
  );
  const [submitterName, setSubmitterName] = useState('');
  const [errors, setErrors] = useState<Partial<Record<ContactField, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: ContactField, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<ContactField, string>> = {};
    const urlFields: ContactField[] = [
      'website',
      'facebook',
      'instagram',
      'twitter',
      'youtube',
      'linkedin',
    ];

    // At least one field must be filled
    const hasAny = CONTACT_FIELDS.some((f) => values[f].trim() !== '');
    if (!hasAny) {
      // Set a generic error
      newErrors.phone = 'Please fill in at least one contact field';
      setErrors(newErrors);
      return false;
    }

    // Validate URL fields
    urlFields.forEach((field) => {
      const val = values[field].trim();
      if (val && !isValidUrl(val)) {
        newErrors[field] = 'Please enter a valid URL (e.g. https://...)';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      const fields: SubmissionFields = {};
      CONTACT_FIELDS.forEach((f) => {
        const val = values[f].trim();
        if (val) {
          fields[f] = val;
        }
      });

      if (useFirestore) {
        await createSubmission(
          facility.id,
          facility.name,
          fields,
          submitterName.trim() || null
        );
      }

      setSuccess(true);
    } catch (err) {
      console.error('Submission error:', err);
      setErrors({ phone: 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="success-state">
            <div className="success-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            </div>
            <h3 className="success-title">Thank you!</h3>
            <p className="success-text">
              Your suggestion for <strong>{facility.name}</strong> has been
              submitted and is pending review. Once approved, the contact
              information will appear on the facility&apos;s listing.
            </p>
            <button
              className="btn btn-primary"
              onClick={onClose}
              style={{ marginTop: '1.25rem' }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Suggest Contact Info</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            Help improve the listing for <strong>{facility.name}</strong> by
            suggesting contact or social media details. Fill in at least one
            field.
          </p>

          {CONTACT_FIELDS.map((field) => (
            <div className="form-group" key={field}>
              <label className="form-label" htmlFor={`suggest-${field}`}>
                {FIELD_ICONS[field]}
                {FIELD_LABELS[field]}
                {facility[field] && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      color: 'var(--color-muted)',
                      fontWeight: 400,
                      marginLeft: 'auto',
                    }}
                  >
                    Current: {facility[field]}
                  </span>
                )}
              </label>
              <input
                id={`suggest-${field}`}
                type={field === 'phone' ? 'tel' : 'url'}
                className={`form-input${errors[field] ? ' error' : ''}`}
                placeholder={FIELD_PLACEHOLDERS[field]}
                value={values[field]}
                onChange={(e) => handleChange(field, e.target.value)}
              />
              {errors[field] && (
                <div className="form-error">{errors[field]}</div>
              )}
            </div>
          ))}

          <div className="form-group" style={{ marginTop: '0.5rem' }}>
            <label className="form-label" htmlFor="suggest-name">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--color-muted)">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              Your Name (optional)
            </label>
            <input
              id="suggest-name"
              type="text"
              className="form-input"
              placeholder="Your name"
              value={submitterName}
              onChange={(e) => setSubmitterName(e.target.value)}
            />
            <div className="form-hint">
              Optional — helps us know who contributed this info
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner" style={{ width: 14, height: 14, marginRight: 0, borderWidth: 2 }} />
                Submitting...
              </>
            ) : (
              'Submit Suggestion'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
