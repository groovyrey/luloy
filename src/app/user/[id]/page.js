'use client';

import { useEffect, useState } from 'react';

import LoadingMessage from '../../../app/components/LoadingMessage';
import { CldImage } from 'next-cloudinary';
import ProfilePictureModal from '../../../app/components/ProfilePictureModal';
import { motion } from 'framer-motion';
import { showToast } from '../../../app/utils/toast';

import React from 'react';
import { AUTH_LEVEL_RANKS } from '../../../app/utils/AuthRankSystem';
import Link from 'next/link';

export default function UserProfilePage({ params }) {
  const { id } = React.use(params);
  const [profileData, setProfileData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (profileData) {
      document.title = `${toTitleCase(profileData.firstName || '')} ${toTitleCase(profileData.lastName || '')}'s Profile`;
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

  

  const authLevelInfo = AUTH_LEVEL_RANKS[profileData.authLevel];

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
          <h2 className="card-title text-center mb-4 display-6 fw-bold text-primary"><span className="bi-person-fill me-2"></span>User Profile</h2>
          
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
            {authLevelInfo && (
              <div
                className="position-absolute bottom-0 end-0 rounded-circle d-flex align-items-center justify-content-center shadow"
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: 'var(--card-background-color)', /* Card background color */
                  right: '15px', /* Adjust for overlap */
                  bottom: '15px', /* Adjust for overlap */
                  /* border: '2px solid var(--bs-primary)' */
                }}
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title={authLevelInfo.title}
              >
                <i className={`${authLevelInfo.icon} ${authLevelInfo.color} fs-5`}></i>
              </div>
            )}
          </div>

          <div className="col-12 text-center mb-3">
              <h1 className="display-4 d-inline-block">{toTitleCase((profileData.firstName || '') + " " + (profileData.lastName || ''))}</h1>
            </div>
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
                  onClick={() => {
                    navigator.clipboard.writeText(profileData.uid);
                    showToast('UID copied to clipboard!', 'success');
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
          <div className="text-center mt-4 pt-3 border-top">
            <Link href="/" className="btn btn-primary btn-lg"><i className="bi-house-door me-2"></i>Back to Home</Link>
          </div>
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