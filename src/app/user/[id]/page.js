'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '../../../app/context/UserContext'; // Import useUser
import LoadingMessage from '../../../app/components/LoadingMessage';
import { CldImage } from 'next-cloudinary';
import Modal from '../../../app/components/Modal';
import { motion } from 'framer-motion';
import { showToast } from '../../../app/utils/toast';

import React from 'react';
import { BADGES, GENDER_OPTIONS, INTEREST_OPTIONS } from '../../../app/utils/BadgeSystem';
import Link from 'next/link';
import ReactIconRenderer from '../../../app/components/ReactIconRenderer';
import CodeSnippetCard from '../../../app/components/CodeSnippetCard'; // Import CodeSnippetCard

// Simple UserCard component for displaying users in modals
const UserCard = ({ user }) => (
  <Link href={`/user/${user.uid}`} className="text-decoration-none text-dark">
    <div className="d-flex align-items-center p-2 border-bottom">
      {user.profilePictureUrl ? (
        <CldImage
          src={user.profilePictureUrl}
          alt={user.fullName}
          width={40}
          height={40}
          crop="fill"
          className="rounded-circle me-3"
        />
      ) : (
        <div
          className="rounded-circle bg-secondary d-flex align-items-center justify-content-center me-3"
          style={{ width: '40px', height: '40px' }}
        >
          <i className="bi bi-person-fill text-white"></i>
        </div>
      )}
      <div>
        <h6 className="mb-0">{user.fullName}</h6>
        {user.bio && <small className="text-muted text-truncate d-block" style={{ maxWidth: '150px' }}>{user.bio}</small>}
      </div>
    </div>
  </Link>
);

export default function UserProfilePage(props) {
  const unwrappedParams = React.use(props.params);
  const { id } = unwrappedParams;
  const { user, userData, refreshUserData } = useUser(); // Get current user and refresh function
  const [profileData, setProfileData] = useState(null);
  const [userSnippets, setUserSnippets] = useState(null); // New state for user snippets
  const [isProfilePictureModalOpen, setIsProfilePictureModalOpen] = useState(false);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
  const [followersUids, setFollowersUids] = useState([]); // Store UIDs
  const [followingUids, setFollowingUids] = useState([]); // Store UIDs
  const [detailedFollowers, setDetailedFollowers] = useState([]); // Store detailed user objects
  const [detailedFollowing, setDetailedFollowing] = useState([]); // Store detailed user objects
  const [loadingFollowLists, setLoadingFollowLists] = useState(false);

  useEffect(() => {
    if (profileData) {
      document.title = `${toTitleCase(profileData.fullName || '')}'s Profile`;
    }
  }, [profileData]);

  const fetchProfile = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/user/${id}`, { next: { revalidate: 3600, tags: ['profile-picture'] } });
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
        // Check if current user is following this profile
        if (userData && userData.following) {
          setIsFollowing(userData.following.includes(id));
        }
      } else {
        const errorData = await res.json();
        showToast(errorData.error || 'Failed to fetch profile.', 'error');
      }
    } catch (err) {
      showToast('An unexpected error occurred while fetching profile.', 'error');
    }
  }, [id, userData]);

  const fetchSnippets = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/user-snippets/${id}`);
      if (res.ok) {
        const data = await res.json();
        setUserSnippets(data);
      } else {
        const errorData = await res.json();
        showToast(errorData.error || 'Failed to fetch user snippets.', 'error');
      }
    } catch (err) {
      showToast('An unexpected error occurred while fetching user snippets.', 'error');
    }
  }, [id]);

  const fetchFollowUids = useCallback(async () => {
    if (!id) return;
    try {
      const [followersRes, followingRes] = await Promise.all([
        fetch(`/api/user/${id}/followers`),
        fetch(`/api/user/${id}/following`)
      ]);

      if (followersRes.ok) {
        const data = await followersRes.json();
        setFollowersUids(data.followers || []);
      }
      if (followingRes.ok) {
        const data = await followingRes.json();
        setFollowingUids(data.following || []);
      }
    } catch (error) {
      console.error("Failed to fetch followers/following UIDs:", error);
    }
  }, [id]);

  const fetchDetailedUsers = useCallback(async (uids, setter) => {
    if (uids.length === 0) {
      setter([]);
      return;
    }
    setLoadingFollowLists(true);
    try {
      const res = await fetch('/api/user/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uids }),
      });
      if (res.ok) {
        const data = await res.json();
        setter(data.users || []);
      } else {
        const errorData = await res.json();
        showToast(errorData.error || 'Failed to fetch user details.', 'error');
      }
    } catch (error) {
      showToast('An unexpected error occurred while fetching user details.', 'error');
      console.error("Error fetching detailed users:", error);
    } finally {
      setLoadingFollowLists(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchSnippets();
    fetchFollowUids();
  }, [id, fetchProfile, fetchSnippets, fetchFollowUids]);

  useEffect(() => {
    // Re-check follow status if current user's data changes
    if (userData && profileData) {
      setIsFollowing(userData.following?.includes(profileData.uid) || false);
    }
  }, [userData, profileData]);

  const handleFollowToggle = async () => {
    if (!user) {
      showToast("Please log in to follow users.", 'info');
      return;
    }
    if (!profileData) return;

    const endpoint = isFollowing ? `/api/user/${profileData.uid}/unfollow` : `/api/user/${profileData.uid}/follow`;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        showToast(isFollowing ? "Unfollowed successfully!" : "Followed successfully!", 'success');
        setIsFollowing(!isFollowing);
        refreshUserData(); // Refresh current user's data to update following list
        fetchFollowUids(); // Refresh profile user's follower/following counts
      } else {
        const errorData = await res.json();
        showToast(errorData.error || "Failed to update follow status.", 'error');
      }
    } catch (error) {
      showToast("An unexpected error occurred.", 'error');
      console.error("Follow/Unfollow error:", error);
    }
  };

  useEffect(() => {
    // Initialize tooltips after component mounts and data is loaded
    if (typeof document !== 'undefined') {
      import('bootstrap').then(bootstrap => {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
        tooltipTriggerList.map(function (tooltipTriggerEl) {
          return new bootstrap.Tooltip(tooltipTriggerEl)
        })
      })
    }
  }, [profileData]); // Re-initialize when profileData changes

  const toTitleCase = (str) => {
    if (!str) return '';
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  };
  
  if (!profileData || !userSnippets) {
    return <LoadingMessage />;
  }

  const userBadges = profileData.badges ? profileData.badges.map(badgeId => BADGES[badgeId]).filter(Boolean) : [];

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div
            className="card shadow-lg border-0 rounded-4 mb-4"
            style={{ overflow: 'hidden' }}
          >
            <div className="card-body p-4">
              <div className="d-flex flex-column align-items-center mb-4">
                <div className="position-relative mb-3" style={{ width: '150px', height: '150px' }}>
                  {profileData.profilePictureUrl ? (
                    <CldImage
                      src={profileData.profilePictureUrl}
                      alt="Profile"
                      width={150}
                      height={150}
                      crop="fill"
                      className="rounded-circle border border-primary border-4 shadow-sm"
                      style={{ objectFit: 'cover', cursor: 'pointer' }}
                      onClick={() => setIsProfilePictureModalOpen(true)}
                    />
                  ) : (
                    <div
                      className="rounded-circle border border-primary border-4 d-flex align-items-center justify-content-center shadow-sm"
                      style={{
                        width: '150px',
                        height: '150px',
                        backgroundColor: 'var(--accent-color)',
                        cursor: 'not-allowed'
                      }}
                    >
                      <i className="bi bi-person-fill" style={{ fontSize: '75px', color: 'var(--light-text-color)' }}></i>
                    </div>
                  )}
                </div>
                <h1 className="mb-1 fw-bold text-center" style={{ fontSize: '2.2rem' }}>{toTitleCase(profileData.fullName || '')}</h1>
                {profileData.bio && (
                  <p className="text-muted fst-italic text-center mb-0">{profileData.bio}</p>
                )}

                {user && user.uid !== id && ( // Only show follow button if not viewing own profile
                  <button
                    className={`btn mt-3 ${isFollowing ? 'btn-outline-secondary' : 'btn-primary'}`}
                    onClick={handleFollowToggle}
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                )}
              </div>

              <div className="d-flex justify-content-center gap-4 mb-4">
                <div className="text-center cursor-pointer" onClick={() => {
                  setIsFollowingModalOpen(true);
                  fetchDetailedUsers(followingUids, setDetailedFollowing);
                }}>
                  <h5 className="mb-0">{followingUids.length}</h5>
                  <span className="text-muted">Following</span>
                </div>
                <div className="text-center cursor-pointer" onClick={() => {
                  setIsFollowersModalOpen(true);
                  fetchDetailedUsers(followersUids, setDetailedFollowers);
                }}>
                  <h5 className="mb-0">{followersUids.length}</h5>
                  <span className="text-muted">Followers</span>
                </div>
              </div>

              <hr className="my-4" />

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-envelope-fill me-2 text-primary"></i>
                    <p className="mb-0 fw-semibold">Email:</p>
                  </div>
                  <p className="text-muted ms-4">
                  {typeof profileData.email === 'string' ? (
                    profileData.email.split('@')[0].substring(0, 3) + '***@' + profileData.email.split('@')[1]
                  ) : (
                    'N/A' // Or some other placeholder
                  )}
                </p>
                </div>
                <div className="col-12 col-md-6">
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-fingerprint me-2 text-primary"></i>
                    <p className="mb-0 fw-semibold">UID:</p>
                  </div>
                  <div className="d-flex align-items-center ms-4">
                    <p className="text-muted mb-0 me-2 small" style={{ wordBreak: 'break-all' }}>{profileData.uid}</p>
                    <button
                      className="btn btn-sm btn-outline-secondary rounded-pill"
                      onClick={async () => {
                        if (!profileData.uid) {
                          showToast("No UID to copy.", 'error');
                          return;
                        }

                        try {
                          if (navigator.clipboard && window.isSecureContext) {
                            await navigator.clipboard.writeText(profileData.uid);
                            showToast("UID copied to clipboard!", 'success');
                          } else {
                            const textArea = document.createElement("textarea");
                            textArea.value = profileData.uid;
                            textArea.style.position = "fixed";
                            textArea.style.left = "-999999px";
                            textArea.style.opacity = "0"; // Make it invisible
                            document.body.appendChild(textArea);
                            textArea.focus();
                            textArea.select();
                            document.execCommand('copy');
                            textArea.remove();
                            showToast("UID copied to clipboard! (Fallback)", 'success');
                          }
                        } catch (err) {
                          showToast("Failed to copy UID.", 'error');
                          console.error("Failed to copy UID:", err);
                        }
                      }}
                      title="Copy UID"
                    >
                      <i className="bi bi-clipboard"></i>
                    </button>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-calendar-event-fill me-2 text-primary"></i>
                    <p className="mb-0 fw-semibold">Age:</p>
                  </div>
                  <p className="text-muted ms-4">{profileData.age}</p>
                </div>
                {profileData.gender && (
                  <div className="col-12 col-md-6">
                    <div className="d-flex align-items-center mb-2">
                      {profileData.gender && (
                        <ReactIconRenderer IconComponent={GENDER_OPTIONS.find(option => option.value === profileData.gender)?.icon} size={20} color={GENDER_OPTIONS.find(option => option.value === profileData.gender)?.color} className="me-2" />
                      )}
                      <p className="mb-0 fw-semibold">Gender:</p>
                    </div>
                    <p className="text-muted ms-4">{profileData.gender}</p>
                  </div>
                )}
                {profileData.location && (
                  <div className="col-12 col-md-6">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-geo-alt-fill me-2 text-primary"></i>
                      <p className="mb-0 fw-semibold">Location:</p>
                    </div>
                    <p className="text-muted ms-4">{profileData.location}</p>
                  </div>
                )}
                {profileData.timezone && (
                  <div className="col-12 col-md-6">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-clock-fill me-2 text-primary"></i>
                      <p className="mb-0 fw-semibold">Timezone:</p>
                    </div>
                    <p className="text-muted ms-4">{profileData.timezone}</p>
                  </div>
                )}
                {profileData.occupation && (
                  <div className="col-12 col-md-6">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-briefcase-fill me-2 text-primary"></i>
                      <p className="mb-0 fw-semibold">Occupation:</p>
                    </div>
                    <p className="text-muted ms-4">{profileData.occupation}</p>
                  </div>
                )}
                {profileData.interests && profileData.interests.length > 0 && (
                  <div className="col-12">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-tags-fill me-2 text-primary"></i>
                      <p className="mb-0 fw-semibold">Interests:</p>
                    </div>
                    <div className="mt-2 d-flex flex-wrap gap-2 ms-4">
                      {profileData.interests.map(interest => {
                        const interestOption = INTEREST_OPTIONS.find(option => option.value === interest);
                        return (
                          <span key={interest} className="badge border border-primary text-primary rounded-pill py-2 px-3 d-flex align-items-center">
                            {interestOption?.icon && (
                              <ReactIconRenderer IconComponent={interestOption.icon} size={16} color={interestOption.color} className="me-1" />
                            )}
                            {interest}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <motion.div
            className="card shadow-lg border-0 rounded-4 mt-4"
          >
            <div className="card-body p-4">
              <h5 className="card-title text-center mb-4 fw-bold">Luloy Badges</h5>
              {userBadges.length > 0 ? (
                <div className="d-flex flex-wrap justify-content-center">
                  {userBadges.map(badge => (
                    <div 
                      key={badge.name}
                      className="m-2 text-center"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedBadge(badge);
                        setIsBadgeModalOpen(true);
                      }}
                    >
                      <div className={`fs-1 ${badge.color}`}>
                        <ReactIconRenderer IconComponent={badge.icon} size={48} color={badge.color} />
                      </div>
                      <small className="d-block text-muted mt-1">{badge.name}</small>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted fst-italic">
                  <p className="mb-0">This user has not earned any badges yet.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* New Section for Code Snippets */}
          <motion.div
            className="card shadow-lg border-0 rounded-4 mt-4"
          >
            <div className="card-body p-4">
              <h5 className="card-title text-center mb-4 fw-bold">Code Snippets</h5>
              {userSnippets && userSnippets.length > 0 ? (
                <div className="row g-3">
                  {userSnippets.map(snippet => (
                    <div key={snippet.id} className="col-12">
                      <CodeSnippetCard snippet={snippet} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted fst-italic">
                  <p className="mb-0">This user has not uploaded any code snippets yet.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {profileData.profilePictureUrl && (
        <Modal
          isOpen={isProfilePictureModalOpen}
          onClose={() => setIsProfilePictureModalOpen(false)}
        >
          <h2 className="text-center mb-4">Profile Picture</h2>
          <CldImage
            src={profileData.profilePictureUrl}
            alt="Profile"
            width={500}
            height={500}
            crop="fill"
            className="img-fluid mx-auto d-block"
            style={{ borderRadius: 'var(--border-radius-base)' }}
          />
        </Modal>
      )}

      {selectedBadge && (
        <Modal
          isOpen={isBadgeModalOpen}
          onClose={() => setIsBadgeModalOpen(false)}
        >
          <h2 className="text-center mb-4">{selectedBadge.name}</h2>
          <div className={`text-center mb-4 ${selectedBadge.color}`}>
            <ReactIconRenderer IconComponent={selectedBadge.icon} size={64} />
          </div>
          <p className="text-center text-muted">{selectedBadge.description}</p>
        </Modal>
      )}

      {/* Followers Modal */}
      <Modal
        isOpen={isFollowersModalOpen}
        onClose={() => setIsFollowersModalOpen(false)}
      >
        <h2 className="text-center mb-4">Followers</h2>
        {loadingFollowLists ? (
          <div className="d-flex justify-content-center my-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : detailedFollowers.length > 0 ? (
          <div>
            {detailedFollowers.map(follower => (
              <UserCard key={follower.uid} user={follower} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted">No followers yet.</p>
        )}
      </Modal>

      {/* Following Modal */}
      <Modal
        isOpen={isFollowingModalOpen}
        onClose={() => setIsFollowingModalOpen(false)}
      >
        <h2 className="text-center mb-4">Following</h2>
        {loadingFollowLists ? (
          <div className="d-flex justify-content-center my-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : detailedFollowing.length > 0 ? (
          <div>
            {detailedFollowing.map(followedUser => (
              <UserCard key={followedUser.uid} user={followedUser} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted">Not following anyone yet.</p>
        )}
      </Modal>
    </div>
  );
}
