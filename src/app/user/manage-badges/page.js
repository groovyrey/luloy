"use client";

import { useState, useEffect } from "react";
import { showToast } from '../../utils/toast';
import { useUser } from '@/app/context/UserContext';
import Link from 'next/link';
import LoadingMessage from '@/app/components/LoadingMessage';
import { BADGES, getComputedPermissions } from '@/app/utils/BadgeSystem';
import ReactIconRenderer from '@/app/components/ReactIconRenderer';

export default function ManageBadgesPage() {
  const { user, loading: userLoading } = useUser();
  
  const [searchUid, setSearchUid] = useState("");
  const [targetUser, setTargetUser] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    document.title = "Manage User Badges";
  }, []);

  if (userLoading) {
    return <LoadingMessage />;
  }

  const userPermissions = user && Array.isArray(user.badges) ? getComputedPermissions(user.badges) : {};

  if (!user || !userPermissions.canAssignBadges) {
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

  const allBadgeIds = Object.keys(BADGES);

  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="card m-2" style={{ maxWidth: '800px', width: '100%' }}>
        <div className="card-body">
          <div className="text-center mb-4">
            <img src="/luloy.svg" alt="Luloy Logo" style={{ height: '3em', marginBottom: '1em' }} />
            <h2 className="card-title text-center">Manage User Badges</h2>
          </div>
          
          <form onSubmit={handleSearch} className="mb-4">
            <div className="mb-3">
              <label htmlFor="searchUid" className="form-label">Search User by UID:</label>
              <input
                type="text"
                id="searchUid"
                className="form-control"
                value={searchUid}
                onChange={(e) => setSearchUid(e.target.value)}
                placeholder="Enter user UID"
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={isSearching}
            >
              {isSearching ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                ''
              )}{' '}{isSearching ? 'Searching...' : 'Search User'}
            </button>
          </form>
        </div>
      </div>

      {targetUser && (
        <div className="card mt-4 shadow-lg rounded-3" style={{ maxWidth: '800px', width: '100%' }}>
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">User: {targetUser.fullName}</h5>
                <p className="mb-0 text-white-50">{targetUser.email}</p>
          </div>
          <div className="card-body">
            <p className="mb-2"><strong>UID:</strong> <span className="text-muted" style={{ wordBreak: 'break-all' }}>{targetUser.uid}</span></p>

            <h6 className="mt-4 mb-2 border-bottom pb-2">Current Badges:</h6>
            {targetUser.badges && targetUser.badges.length > 0 ? (
              <div className="d-flex flex-wrap gap-2 mb-3">
                {targetUser.badges.map(badgeId => {
                  const badge = BADGES[badgeId];
                  return badge ? (
                    <span key={badgeId} className={`badge d-flex align-items-center p-2 ${badge.color}`}>
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
              <p className="text-muted">No badges assigned.</p>
            )}

            <h6 className="mt-4 mb-2 border-bottom pb-2">Available Badges:</h6>
            <div className="d-flex flex-wrap gap-2">
              {allBadgeIds.map(badgeId => {
                const badge = BADGES[badgeId];
                const hasBadge = targetUser.badges && targetUser.badges.includes(badgeId);
                return badge ? (
                  <button
                    key={badgeId}
                    type="button"
                    className={`btn btn-sm ${hasBadge ? 'btn-secondary' : 'btn-outline-primary'}`}
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
      )}
    </div>
  );
}