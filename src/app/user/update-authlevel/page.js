"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { showToast } from '../../utils/toast';
import { useUser } from '@/app/context/UserContext';
import Link from 'next/link';
import LoadingMessage from '@/app/components/LoadingMessage';

export default function UpdateAuthLevelPage() {
  const { user, userData, loading: userLoading } = useUser();
  useEffect(() => {
    document.title = "Update User Auth Level";
  }, []);
  const [uid, setUid] = useState("");
  const [authLevel, setAuthLevel] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  if (userLoading) {
    return <LoadingMessage />;
  }

  if (!user || !userData || userData.authLevel !== 1) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        <div className="card m-2 text-center" style={{ maxWidth: '400px', width: '100%' }}>
          <div className="card-body">
            <div className="text-center mb-4">
              <img src="/luloy.svg" alt="Luloy Logo" style={{ height: '3em', marginBottom: '1em' }} />
              <h2 className="card-title text-center text-danger"><i className="bi bi-exclamation-triangle me-2"></i>Unauthorized Access</h2>
            </div>
            <p className="text-lg text-muted mb-8">You are not authorized to view this page.</p>
            <Link href="/" className="btn btn-primary">
              <i className="bi-house-door me-2"></i> Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    if (!uid || authLevel === "") {
      showToast("Please enter both UID and Auth Level.", 'error');
      setIsUpdating(false);
      return;
    }

    try {
      const response = await fetch("/api/user/update-authlevel", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid, authLevel: parseInt(authLevel) }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(data.message, 'success');
        setUid("");
        setAuthLevel("");
        router.push('/login');
        router.refresh();
      } else {
        showToast(data.error || "Failed to update auth level.", 'error');
      }
    } catch (err) {
      showToast("An unexpected error occurred.", 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="card m-2" style={{ maxWidth: '600px', width: '100%' }}>
        <div className="card-body">
          <div className="text-center mb-4">
            <img src="/luloy.svg" alt="Luloy Logo" style={{ height: '3em', marginBottom: '1em' }} />
            <h2 className="card-title text-center">Update User Auth Level</h2>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="uid" className="form-label">User UID:</label>
              <input
                type="text"
                id="uid"
                className="form-control"
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="authLevel" className="form-label">Auth Level:</label>
              <input
                type="number"
                id="authLevel"
                className="form-control"
                value={authLevel}
                onChange={(e) => setAuthLevel(e.target.value)}
                required
                min="0"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                ''
              )}{' '}{isUpdating ? 'Updating...' : 'Update Auth Level'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
