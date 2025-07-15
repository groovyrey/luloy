'use client';

import Link from 'next/link';
import { useUser } from '../context/UserContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Offcanvas.module.css';

export default function Offcanvas({ isOpen, onClose }) {
  const { user, userData, logout, loading } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    onClose();
    setIsDropdownOpen(false);
  };

  const handleDropdownLinkClick = () => {
    setIsDropdownOpen(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.offcanvasBackdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.offcanvas}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            
            <div className={styles.offcanvasBody}>
              <div className={styles.navbarLinks}>
                <ul>
                  <li>
                    <Link href="/messages/public" onClick={onClose}>
                      <i className="bi bi-chat-left-text me-2"></i>Public Messages
                    </Link>
                  </li>
                  <li>
                    <Link href="/messages/send" onClick={onClose}>
                      <i className="bi bi-send me-2"></i>Send Message
                    </Link>
                  </li>
                  <li>
                    <Link href="/user/search" onClick={onClose}>
                      <i className="bi bi-search me-2"></i>Search Users
                    </Link>
                  </li>
                  <li>
                    <Link href="/chat" onClick={onClose}>
                      <i className="bi bi-chat-dots me-2"></i>Global Chat
                    </Link>
                  </li>
                  <li>
                    <Link href="/code" onClick={onClose}>
                      <i className="bi bi-code-slash me-2"></i>Luloy Codes
                    </Link>
                  </li>
                  <li>
                    <Link href="/learn" onClick={onClose}>
                      <i className="bi bi-book me-2"></i>Learn
                    </Link>
                  </li>
                </ul>
              </div>
              <div className={styles.navbarActions}>
                {loading ? (
                  <div className={styles.loadingSpinner}></div>
                ) : user ? (
                  <div className={styles.userProfileContainer}>
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={`btn btn-primary ${styles.userProfileButton}`}>
                      {userData?.profilePictureUrl ? (
                        <img src={userData.profilePictureUrl} alt={userData.username || userData.firstName} className={styles.profilePicture} />
                      ) : (
                        <i className="bi bi-person-circle"></i>
                      )}
                      <span className="ms-2">{userData?.username || userData?.firstName}</span>
                    </button>
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div 
                          className={styles.dropdownMenu}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Link href={`/user/${userData?.username || user.uid}`} onClick={handleDropdownLinkClick}>
                            <i className="bi bi-person-fill"></i> View Profile
                          </Link>
                          <Link href="/user/settings" onClick={handleDropdownLinkClick}>
                            <i className="bi bi-gear-fill"></i> Settings
                          </Link>
                          <button onClick={handleLogout}>
                            <i className="bi bi-box-arrow-right"></i> Logout
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className={styles.authButtons}>
                    <Link href="/login" onClick={onClose} className="btn btn-primary">
                      <i className="bi bi-box-arrow-in-right"></i>Login
                    </Link>
                    <Link href="/signup" onClick={onClose} className="btn btn-primary">
                      <i className="bi bi-person-plus-fill"></i>Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}