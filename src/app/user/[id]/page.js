'use client';

import { useEffect, useState } from 'react';

import LoadingMessage from '../../../app/components/LoadingMessage';
import { CldImage } from 'next-cloudinary';
import ProfilePictureModal from '../../../app/components/ProfilePictureModal';
import { motion } from 'framer-motion';
import { showToast } from '../../../app/utils/toast';

import React from 'react';
import { BADGES } from '../../../app/utils/BadgeSystem';
import Link from 'next/link';
import ReactIconRenderer from '../../../app/components/ReactIconRenderer';

export default function UserProfilePage({ params }) {
  const { id } = React.use(params);
  const [profileData, setProfileData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      fetchProfile();
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
  
  if (!profileData) {
  return <LoadingMessage />;
}

  

  const userBadges = profileData.badges ? profileData.badges.map(badgeId => BADGES[badgeId]).filter(Boolean) : [];

  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <motion.div
        className="card m-2 shadow-lg rounded-3"
        style={{ maxWidth: '600px', width: '100%' }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="card-body p-4">
          
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
                onClick={() => setIsModalOpen(true)}
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
        className="card m-2 mt-4 shadow-lg rounded-3"
        style={{ maxWidth: '600px', width: '100%' }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="card-body p-4">
          <h5 className="card-title text-center mb-4">Badges</h5>
          {userBadges.length > 0 ? (
            <div className="d-flex flex-wrap justify-content-center">
              {userBadges.map(badge => (
                <div 
                  key={badge.name} 
                  className="me-2 mb-2"
                  data-bs-toggle="tooltip"
                  data-bs-html="true"
                  title={`<strong>${badge.name}</strong><br>${badge.description}`}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={`fs-2 ${badge.color}`}>
                    <ReactIconRenderer IconComponent={badge.icon} size={32} color={badge.color} />
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

      

      {profileData.profilePictureUrl && (
        <ProfilePictureModal
          imageUrl={profileData.profilePictureUrl}
          onClose={() => setIsModalOpen(false)}
          isOpen={isModalOpen}
        />
      )}
    </div>
  );
}