"use client";

import { useState, useEffect } from "react";
import { showToast } from '../../utils/toast';
import { useUser } from '@/app/context/UserContext';
import Link from 'next/link';
import LoadingMessage from '@/app/components/LoadingMessage';
import { BADGES, getComputedPermissions } from '@/app/utils/BadgeSystem';
import ReactIconRenderer from '@/app/components/ReactIconRenderer';

export default function UserManagementPage() {
  const { user, loading: userLoading } = useUser();
  
  const [searchUid, setSearchUid] = useState("");
  const [targetUser, setTargetUser] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    document.title = "User Management";
  }, []);

  if (userLoading) {
    return <LoadingMessage />;
  }

  const userPermissions = user && Array.isArray(user.badges) ? getComputedPermissions(user.badges) : {};

  if (!user || !userPermissions.canManageUsers) { // Updated permission check
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        <div className="card m-2 text-center" style={{ maxWidth: '400px', width: '100%' }}>
          <div className="card-body">
            <div className="text-center mb-4">
              <img src="/luloy.svg" alt="Luloy Logo" style={{ height: '3em', marginBottom: '1em' }} />
              <h2 className="card-title text-danger"><i className="bi bi-exclamation-triangle me-2"></i>Unauthorized Access</h2>
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

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    setTargetUser(null); // Clear previous search results

    if (!searchUid) {
      showToast("Please enter a User UID to search.", 'error');
      setIsSearching(false);
      return;
    }

    try {
      const response = await fetch(`/api/user/${searchUid}`);
      if (response.ok) {
        const data = await response.json();
        setTargetUser(data);
        showToast("User found!", 'success');
      } else {
        const errorData = await response.json();
        showToast(errorData.error || "User not found.", 'error');
      }
    } catch (err) {
      showToast("An unexpected error occurred during search.", 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const updateBadges = async (updatedBadges) => {
    setIsUpdating(true);
    try {
      const response = await fetch("/api/user/update-badges", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.idToken}`,
        },
        body: JSON.stringify({ uid: targetUser.uid, badges: updatedBadges }),
      });

      const data = await response.json();

      if (response.ok) {
        setTargetUser(prev => ({ ...prev, badges: updatedBadges }));
        showToast(data.message || "Badges updated successfully!", 'success');
      } else {
        showToast(data.error || "Failed to update badges.", 'error');
      }
    } catch (err) {
      showToast("An unexpected error occurred during badge update.", 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddBadge = (badgeId) => {
    if (targetUser && !targetUser.badges.includes(badgeId)) {
      const updatedBadges = [...targetUser.badges, badgeId];
      updateBadges(updatedBadges);
    }
  };

  const handleRemoveBadge = (badgeId) => {
    if (targetUser && targetUser.badges.includes(badgeId)) {
      const updatedBadges = targetUser.badges.filter(id => id !== badgeId);
      updateBadges(updatedBadges);
    }
  };

  const handleForcePasswordReset = async () => {
    if (!targetUser || !targetUser.uid) {
      showToast("No user selected for password reset.", 'error');
      return;
    }

    if (!confirm(`Are you sure you want to force a password reset for ${targetUser.fullName}? This will set their password to the one you entered.`)) {
      return;
    }

    setIsResettingPassword(true);
    try {
      const response = await fetch("/api/user/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.idToken}`,
        },
        body: JSON.stringify({ uid: targetUser.uid, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(`Password for ${targetUser.fullName} reset successfully!`, 'success');
        setNewPassword(""); // Clear the password field
      } else {
        showToast(data.error || "Failed to reset password.", 'error');
      }
    } catch (err) {
      showToast("An unexpected error occurred during password reset.", 'error');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const allBadgeIds = Object.keys(BADGES);

  return (
    <div className="container py-5 animated fadeIn">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-7">
          <div className="card">
            <div className="card-header">
              <img src="/luloy.svg" alt="Luloy Logo" className="mb-3" style={{ height: '4.5em' }} />
              <h2 className="card-title fw-bold mb-0 fs-3">User Management</h2>
              <p className="mb-0 opacity-75">Search and manage user accounts.</p>
            </div>
            <div className="card-body">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="input-group input-group-lg shadow-sm rounded-pill overflow-hidden border border-primary">
                  <input
                    type="text"
                    className="form-control border-0 ps-4"
                    placeholder="Enter user UID to search..."
                    value={searchUid}
                    onChange={(e) => setSearchUid(e.target.value)}
                    disabled={isSearching}
                  />
                  <button className="btn btn-primary px-4" type="submit" disabled={isSearching}>
                    {isSearching ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                      <i className="bi bi-search"></i>
                    )}
                    <span className="ms-2 d-none d-sm-inline">Search</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {targetUser && (
        <div className="row justify-content-center mt-4 animated fadeIn delay-1s">
          <div className="col-md-8 col-lg-7">
            <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
              <div className="card-header">
                <h5 className="mb-0 fs-4"><i className="bi bi-person-circle me-2"></i>User Profile: {targetUser.fullName}</h5>
                <p className="mb-0 opacity-75">{targetUser.email}</p>
              </div>
              <div className="card-body">
                <div className="mb-4">
                  <p className="mb-1"><strong>UID:</strong> <span className="text-muted user-select-all small" style={{ wordBreak: 'break-all' }}>{targetUser.uid}</span></p>
                  {targetUser.metadata && (
                    <>
                      <p className="mb-1"><strong>Account Created:</strong> <span className="text-muted small">{new Date(targetUser.metadata.creationTime).toLocaleDateString()}</span></p>
                      <p className="mb-1"><strong>Last Sign-in:</strong> <span className="text-muted small">{new Date(targetUser.metadata.lastSignInTime).toLocaleDateString()}</span></p>
                    </>
                  )}
                </div>

                <h6 className="border-bottom pb-2 mb-3 text-primary fw-bold">Actions:</h6>
                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">New Password:</label>
                  <input
                    type="password"
                    id="newPassword"
                    className="form-control"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <button
                  className="btn btn-warning w-100 mb-3 d-flex align-items-center justify-content-center animate__animated animate__fadeInUp"
                  onClick={handleForcePasswordReset}
                  disabled={isResettingPassword || !newPassword}
                >
                  {isResettingPassword ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-key me-2"></i>Force Password Reset
                    </>
                  )}
                </button>

                <h6 className="border-bottom pb-2 mb-3 text-primary fw-bold mt-4">Current Badges:</h6>
                {targetUser.badges && targetUser.badges.length > 0 ? (
                  <div className="d-flex flex-wrap gap-2 mb-3 animate__animated animate__fadeInUp">
                    {targetUser.badges.map(badgeId => {
                      const badge = BADGES[badgeId];
                      return badge ? (
                        <span key={badgeId} className={`badge d-flex align-items-center p-2 rounded-pill ${badge.color} shadow-sm`}>
                          <ReactIconRenderer IconComponent={badge.icon} size={16} className="me-2" />
                          {badge.name}
                          <button
                            type="button"
                            className="btn-close btn-close-white ms-2"
                            aria-label="Remove badge"
                            onClick={() => handleRemoveBadge(badgeId)}
                            disabled={isUpdating}
                          ></button>
                        </span>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <p className="text-muted fst-italic">No badges assigned.</p>
                )}

                <h6 className="border-bottom pb-2 mb-3 text-primary fw-bold mt-4">Available Badges:</h6>
                <div className="d-flex flex-wrap gap-2 animate__animated animate__fadeInUp">
                  {allBadgeIds.map(badgeId => {
                    const badge = BADGES[badgeId];
                    const hasBadge = targetUser.badges && targetUser.badges.includes(badgeId);
                    return badge ? (
                      <button
                        key={badgeId}
                        type="button"
                        className={`btn btn-sm rounded-pill shadow-sm ${hasBadge ? 'btn-secondary' : 'btn-outline-primary'}`}
                        onClick={() => hasBadge ? handleRemoveBadge(badgeId) : handleAddBadge(badgeId)}
                        disabled={isUpdating}
                      >
                        <ReactIconRenderer IconComponent={badge.icon} size={16} className="me-2" />
                        {badge.name}
                        {hasBadge ? ' (Remove)' : ' (Add)'}
                      </button>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}