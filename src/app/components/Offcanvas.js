'use client';

import Link from 'next/link';
import { useUser } from '../context/UserContext';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Offcanvas.module.css';
import { useTheme } from '../context/ThemeContext'; // Import useTheme

export default function Offcanvas({ isOpen, onClose }) {
  const { user, userData, logout, loading } = useUser();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMessagesDropdownOpen, setIsMessagesDropdownOpen] = useState(false);
  const { theme, toggleTheme } = useTheme(); // Use theme hook

  const handleLogout = () => {
    logout();
    setIsUserDropdownOpen(false);
    setIsMessagesDropdownOpen(false);
    setTimeout(() => {
      onClose();
    }, 300); // Match the dropdown exit animation duration
  };

  const handleDropdownLinkClick = () => {
    setIsUserDropdownOpen(false);
    setIsMessagesDropdownOpen(false);
    setTimeout(() => {
      onClose();
    }, 300); // Match the dropdown exit animation duration
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setIsUserDropdownOpen(false);
      setIsMessagesDropdownOpen(false);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
                  <li className={styles.navDropdown}>
                    <button onClick={() => setIsMessagesDropdownOpen(!isMessagesDropdownOpen)}>
                      <i className="bi bi-envelope me-2"></i>Messages
                      <i className={`bi bi-chevron-down ${isMessagesDropdownOpen ? 'rotate-180' : ''}`}></i>
                    </button>
                    <AnimatePresence>
                      {isMessagesDropdownOpen && (
                        <motion.div
                          className={styles.navDropdownMenu}
                          initial={{ maxHeight: 0, opacity: 0 }}
                          animate={{ maxHeight: "150px", opacity: 1 }}
                          exit={{ maxHeight: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                          <motion.div
                          className={styles.navDropdownMenu}
                          initial={{ maxHeight: 0, opacity: 0 }}
                          animate={{ maxHeight: "150px", opacity: 1 }}
                          exit={{ maxHeight: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                          <div className={styles.navDropdownContent}>
                            <Link href="/messages/public" onClick={onClose}>
                              Public Messages
                            </Link>
                            <Link href="/messages/send" onClick={onClose}>
                              Send Message
                            </Link>
                          </div>
                        </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                  <li>
                    <Link href="/user/search" onClick={onClose}>
                      <i className="bi bi-search me-2"></i>Search Users
                    </Link>
                  </li>
                  <li>
                    
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
                  <li>
                    <button onClick={toggleTheme} className="btn btn-link text-decoration-none w-100 text-start">
                      <AnimatePresence mode="wait" initial={false}>
                        {theme === 'light' ? (
                          <motion.span
                            key="dark-mode"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                          >
                            <i className="bi bi-moon-fill me-2"></i>Dark Mode
                          </motion.span>
                        ) : (
                          <motion.span
                            key="light-mode"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            <i className="bi bi-sun-fill me-2"></i>Light Mode
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                  </li>
                </ul>
                {user?.permissions?.canAssignBadges && (
                  <div className={styles.adminNav}>
                    <p className={styles.adminNavLabel}>Admin Navigation</p>
                    <ul>
                      <li>
                        <Link href="/user/manage-badges" onClick={onClose}>
                          <i className="bi bi-person-badge me-2"></i>Manage Badges
                        </Link>
                      </li>
                      <li>
                        <Link href="/messages/private" onClick={onClose}>
                          <i className="bi bi-shield-lock me-2"></i>Private Messages
                        </Link>
                      </li>
                      
                    </ul>
                  </div>
                )}
              </div>
              <div className={styles.navbarActions}>
                {loading ? (
                  <div className={styles.loadingSpinner}></div>
                ) : user ? (
                  <div className={styles.userProfileContainer}>
                    <button onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} className={styles.userProfileButton}>
                      {userData?.profilePictureUrl ? (
                        <img src={userData.profilePictureUrl} alt={userData.username || userData.firstName} className={styles.profilePicture} />
                      ) : (
                        <i className="bi bi-person-circle"></i>
                      )}
                      <span className="ms-2">{userData?.username || userData?.firstName}</span>
                    </button>
                    <AnimatePresence>
                      {isUserDropdownOpen && (
                        <motion.div 
                          className={styles.dropdownMenu}
                          initial={{ maxHeight: 0, opacity: 0 }}
                          animate={{ maxHeight: "150px", opacity: 1 }}
                          exit={{ maxHeight: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
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
                    <Link href="/login" onClick={onClose} className={styles.authButton}>
                      <i className="bi bi-box-arrow-in-right me-2"></i>Login
                    </Link>
                    <Link href="/signup" onClick={onClose} className={styles.authButton}>
                      <i className="bi bi-person-plus-fill me-2"></i>Sign Up
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