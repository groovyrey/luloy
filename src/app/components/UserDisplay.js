'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { useUser } from '../context/UserContext';
import LoadingMessage from './LoadingMessage';
import styles from './UserDisplay.module.css';
import { CldImage } from 'next-cloudinary';
import ProfilePictureModal from './ProfilePictureModal';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserDisplay() {
  const router = useRouter();
  const { user, userData, loading, logout } = useUser();
  
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef(null);

  const optionsVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickCoutside);
    };
  }, [optionsRef]);

  if (loading) {
    return <LoadingMessage />;
  }

  

  const handleLogout = () => {
    setShowOptions(false);
    logout();
  };

  return (
    <div
      className={`${styles.userDisplayContainer} card m-2 text-center shadow-lg rounded-3`}
    >
      {user ? (
        <div className="card-body">
          {userData && (
            <div className="text-center mb-3"> {/* New wrapper div for centering */} 
              {userData.profilePictureUrl ? (
                <CldImage
                  key={userData.profilePictureUrl || "no-profile-picture"}
                  src={userData.profilePictureUrl}
                  alt="Profile"
                  width={100}
                  height={100}
                  crop="fill"
                  className={`rounded-circle border border-primary border-3`}
                  style={{ objectFit: 'cover' }}
                  onLoad={() => setImageLoaded(true)}
                />
              ) : (
                <div
                  className={`${styles.profilePicture} rounded-circle border border-primary border-3 d-flex align-items-center justify-content-center mx-auto`}
                  style={{
                    width: '100px',
                    height: '100px',
                    backgroundColor: '#e9ecef',
                    cursor: 'not-allowed'
                  }}
                >
                  <i className="bi bi-person-fill" style={{ fontSize: '50px', color: '#adb5bd' }}></i>
                </div>
              )}
            </div>
          )}
          <p className="card-title">Logged in as: {userData?.username || user.email}</p>
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-center gap-2 gap-md-3">
            <button className="btn btn-link" onClick={() => setShowOptions(!showOptions)}>
              <i className="bi bi-three-dots"></i>
            </button>
          </div>
          <AnimatePresence>
            {showOptions && (
              <motion.div
                ref={optionsRef}
                className={styles.optionsMenu}
                variants={optionsVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.2 }}
              >
                <Link href={`/user/${userData?.username || user.uid}`} className="btn btn-link text-start" onClick={() => setShowOptions(false)}>
                  <i className="bi bi-person-vcard me-2"></i> View Profile
                </Link>
                <Link href="/user/settings" className="btn btn-link text-start" onClick={() => setShowOptions(false)}>
                  <i className="bi bi-gear me-2"></i> User Settings
                </Link>
                <button className="btn btn-link text-danger text-start" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="card-body">
          <p><i className="bi bi-person-slash me-2"></i>Not logged in.</p>
        </div>
      )}
    {showModal && (
      <ProfilePictureModal
        imageUrl={modalImageUrl}
        onClose={() => setShowModal(false)}
        isOpen={showModal}
      />
    )}
  </div>
)}