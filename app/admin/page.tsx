'use client';

import { useAuth } from '@/lib/auth';
import ReviewQueue from '@/components/ReviewQueue';

export default function AdminPage() {
  const { user, loading, isAdmin, signIn, signOut } = useAuth();

  if (loading) {
    return (
      <div className="auth-container">
        <div className="loading-container">
          <span className="spinner" />
          Checking authentication...
        </div>
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="var(--color-brand)"
            style={{ marginBottom: '1rem' }}
          >
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
          </svg>
          <h2>Admin Access</h2>
          <p>
            Sign in with the authorized Google account to review pending
            submissions.
          </p>
          <button className="google-btn" onClick={signIn}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  // Signed in but not authorized
  if (!isAdmin) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="var(--color-error)"
            style={{ marginBottom: '1rem' }}
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <h2>Not Authorized</h2>
          <p>
            The account <strong>{user.email}</strong> does not have admin
            access. Please sign in with the authorized admin account.
          </p>
          <button className="btn btn-secondary" onClick={signOut} style={{ marginTop: '0.5rem' }}>
            Sign out & try another account
          </button>
        </div>
      </div>
    );
  }

  // Authorized admin
  return (
    <div className="admin-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <h1 className="admin-title">Review Queue</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>
            {user.email}
          </span>
          <button className="btn btn-secondary btn-sm" onClick={signOut}>
            Sign out
          </button>
        </div>
      </div>
      <p className="admin-subtitle">
        Review and approve community-submitted contact information for health
        facilities.
      </p>

      <ReviewQueue />
    </div>
  );
}
