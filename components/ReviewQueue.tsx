'use client';

import { useState, useEffect, useCallback } from 'react';
import { Submission, CONTACT_FIELDS, ContactField, Facility } from '@/lib/types';
import {
  getPendingSubmissions,
  approveSubmission,
  rejectSubmission,
} from '@/lib/submissions';
import { getAllFacilities } from '@/lib/facilities';

const FIELD_LABELS: Record<ContactField, string> = {
  phone: 'Phone',
  website: 'Website',
  facebook: 'Facebook',
  instagram: 'Instagram',
  twitter: 'X (Twitter)',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
};

export default function ReviewQueue() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [facilities, setFacilities] = useState<Map<string, Facility>>(new Map());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [subs, facs] = await Promise.all([
        getPendingSubmissions(),
        getAllFacilities(),
      ]);
      setSubmissions(subs);
      const facMap = new Map(facs.map((f) => [f.id, f]));
      setFacilities(facMap);
    } catch (err) {
      console.error('Failed to load review data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApprove = async (submission: Submission) => {
    setActionLoading(submission.id);
    try {
      await approveSubmission(submission);
      setSubmissions((prev) => prev.filter((s) => s.id !== submission.id));
    } catch (err) {
      console.error('Failed to approve:', err);
      alert('Failed to approve submission. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (submissionId: string) => {
    setActionLoading(submissionId);
    try {
      await rejectSubmission(submissionId);
      setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
    } catch (err) {
      console.error('Failed to reject:', err);
      alert('Failed to reject submission. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <span className="spinner" />
        Loading submissions...
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="empty-state">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
        <h3>All caught up!</h3>
        <p>There are no pending submissions to review.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span className="admin-count">{submissions.length} pending</span>
        <button className="btn btn-secondary btn-sm" onClick={loadData}>
          Refresh
        </button>
      </div>

      {submissions.map((sub) => {
        const facility = facilities.get(sub.facilityId);
        const isProcessing = actionLoading === sub.id;

        return (
          <div key={sub.id} className="submission-card">
            <div className="submission-facility">{sub.facilityName}</div>
            <div className="submission-meta">
              {sub.submitterName && (
                <span>Submitted by <strong>{sub.submitterName}</strong> · </span>
              )}
              <span>{sub.createdAt.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}</span>
            </div>

            <div className="submission-fields">
              {CONTACT_FIELDS.map((field) => {
                const suggested = sub.fields[field];
                if (!suggested) return null;

                const current = facility?.[field];

                return (
                  <div key={field} className="submission-field">
                    <span className="field-label">{FIELD_LABELS[field]}</span>
                    <div>
                      <div className="field-value">{suggested}</div>
                      {current && (
                        <div className="field-current">
                          Currently: {current}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="submission-actions">
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleReject(sub.id)}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Reject'}
              </button>
              <button
                className="btn btn-success btn-sm"
                onClick={() => handleApprove(sub)}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : '✓ Approve'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
