'use client';

import { useEffect, useState } from 'react';

import LoadingMessage from '../../../app/components/LoadingMessage';
import { CldImage } from 'next-cloudinary';
import Modal from '../../../app/components/Modal';
import { motion } from 'framer-motion';
import { showToast } from '../../../app/utils/toast';

import React from 'react';
import { BADGES } from '../../../app/utils/BadgeSystem';
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
          const res = await fetch(`/api/user/${id}`);
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
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <motion.div
        className="card"
        style={{ maxWidth: '600px', width: '100%' }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="card-body">
          
          <div className="position-relative mx-auto mb-4" style={{ width: '150px', height: '150px' }}>
            {profileData.profilePictureUrl ? (
              <CldImage
                src={profileData.profilePictureUrl}
                alt="Profile"
                width={150}
                height={150}
                crop="fill"
                className="rounded-circle border border-primary border-3"
                style={{ objectFit: 'cover', cursor: 'pointer' }}
                onClick={() => setIsProfilePictureModalOpen(true)}
              />
            ) : (
              <div
                className="rounded-circle border border-primary border-3 d-flex align-items-center justify-content-center"
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

          <div className="col-12 text-center mb-3">
            <div className="d-flex justify-content-center align-items-baseline flex-wrap">
              <h1 className="mb-0 me-2" style={{ fontSize: '28px' }}>{toTitleCase(profileData.fullName || '')}</h1>
            </div>
            </div>
            {profileData.bio && (
              <div className="col-12 text-center mb-3">
                <p className="text-muted fst-italic">{profileData.bio}</p>
              </div>
            )}

            
          <div className="row mb-3">
            <div className="col-12 col-md-6">
              <p className="mb-1"><strong>Email:</strong></p>
              <p className="text-muted">{profileData.email.split('@')[0].substring(0, 3) + '***@' + profileData.email.split('@')[1]}</p>
            </div>
            <div className="col-12 col-md-6">
              <p className="mb-1"><strong>UID:</strong></p>
              <div className="d-flex align-items-center">
                <p className="text-muted mb-0 me-2" style={{ wordBreak: 'break-all' }}>{profileData.uid}</p>
                <button
                  className="btn btn-sm btn-outline-secondary"
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
                        // Fallback for non-secure contexts or older browsers
                        const textArea = document.createElement("textarea");
                        textArea.value = profileData.uid;
                        textArea.style.position = "fixed"; // Avoid scrolling to bottom
                        textArea.style.left = "-999999px"; // Move off-screen
                        textArea.style.left = "-999999px"; // Move off-screen
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
              <p className="mb-1"><strong>Age:</strong></p>
              <p className="text-muted">{profileData.age}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="card mt-4"
        style={{ maxWidth: '600px', width: '100%' }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="card-body">
          <h5 className="card-title text-center mb-4">Luloy Badges</h5>
          {userBadges.length > 0 ? (
            <div className="d-flex flex-wrap justify-content-start">
              {userBadges.map(badge => (
                <div 
                  key={badge.name}
                  className="me-2 mb-2"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedBadge(badge);
                    setIsBadgeModalOpen(true);
                  }}
                >
                  <div className={`fs-1 ${badge.color}`}>
                    <ReactIconRenderer IconComponent={badge.icon} size={48} color={badge.color} />
                  </div>
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
      <div className="mt-4 w-100" style={{ maxWidth: '600px' }}>
        <h5 className="text-center mb-4">Code Snippets</h5>
        {userSnippets && userSnippets.length > 0 ? (
          userSnippets.map(snippet => (
            <CodeSnippetCard key={snippet.id} snippet={snippet} />
          ))
        ) : (
          <div className="text-center text-muted fst-italic">
            <p className="mb-0">This user has not uploaded any code snippets yet.</p>
          </div>
        )}
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
    </div>
  );
}