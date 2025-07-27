'use client';

import { useEffect, useState } from 'react';

import LoadingMessage from '../../../app/components/LoadingMessage';
import { CldImage } from 'next-cloudinary';
import Modal from '../../../app/components/Modal';
import { motion } from 'framer-motion';
import { showToast } from '../../../app/utils/toast';

import React from 'react';
import { BADGES, GENDER_ICONS, INTEREST_ICONS } from '../../../app/utils/BadgeSystem';
import Link from 'next/link';
import ReactIconRenderer from '../../../app/components/ReactIconRenderer';
import CodeSnippetCard from '../../../app/components/CodeSnippetCard'; // Import CodeSnippetCard

export default function UserProfilePage({ params }) {
  const { id } = React.use(params);
  const [profileData, setProfileData] = useState(null);
  const [userSnippets, setUserSnippets] = useState(null); // New state for user snippets
  const [isProfilePictureModalOpen, setIsProfilePictureModalOpen] = useState(false);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);

  useEffect(() => {
    if (profileData) {
      document.title = `${toTitleCase(profileData.fullName || '')}'s Profile`;
    }
  }, [profileData]);

  useEffect(() => {
    if (id) {
      const fetchProfile = async () => {
        try {
          const res = await fetch(`/api/user/${id}`, { next: { revalidate: 3600, tags: ['profile-picture'] } });
          if (res.ok) {
            const data = await res.json();
            setProfileData(data);
          } else {
            const errorData = await res.json();
            showToast(errorData.error || 'Failed to fetch profile.', 'error');
          }
        } catch (err) {
          showToast('An unexpected error occurred while fetching profile.', 'error');
        }
      };

      const fetchSnippets = async () => {
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
      };

      fetchProfile();
      fetchSnippets();
    }
  }, [id]);

  

  

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
    <div className="d-flex flex-column align-items-center justify-content-center py-4" style={{ minHeight: '80vh' }}>
      <motion.div
        className="card shadow-lg border-0 rounded-4"
        style={{ maxWidth: '600px', width: '100%', overflow: 'hidden' }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
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
          </div>

          <hr className="my-4" />

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="d-flex align-items-center mb-2">
                <i className="bi bi-envelope-fill me-2 text-primary"></i>
                <p className="mb-0 fw-semibold">Email:</p>
              </div>
              <p className="text-muted ms-4">{profileData.email.split('@')[0].substring(0, 3) + '***@' + profileData.email.split('@')[1]}</p>
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
                  {GENDER_ICONS[profileData.gender] && (
                    <ReactIconRenderer IconComponent={GENDER_ICONS[profileData.gender].icon} size={20} color={GENDER_ICONS[profileData.gender].color} className="me-2" />
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
                    const interestIcon = INTEREST_ICONS[interest];
                    return (
                      <span key={interest} className="badge border border-primary text-primary rounded-pill py-2 px-3 d-flex align-items-center">
                        {interestIcon && (
                          <ReactIconRenderer IconComponent={interestIcon.icon} size={16} color={interestIcon.color} className="me-1" />
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
      </motion.div>

      <motion.div
        className="card shadow-lg border-0 rounded-4 mt-4"
        style={{ maxWidth: '600px', width: '100%' }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
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
        style={{ maxWidth: '600px', width: '100%' }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="card-body p-4">
          <h5 className="card-title text-center mb-4 fw-bold">Code Snippets</h5>
          {userSnippets && userSnippets.length > 0 ? (
            <div className="d-grid gap-3">
              {userSnippets.map(snippet => (
                <CodeSnippetCard key={snippet.id} snippet={snippet} />
              ))}
            </div>
          ) : (
            <div className="text-center text-muted fst-italic">
              <p className="mb-0">This user has not uploaded any code snippets yet.</p>
            </div>
          )}
        </div>
      </motion.div>

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
    </div>
  );
}