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
              <div className={styles.scrollableNavContent}>
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
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            variants={{
                              hidden: { opacity: 0, maxHeight: 0 },
                              visible: {
                                opacity: 1,
                                maxHeight: "500px",
                                transition: {
                                  type: "spring",
                                  stiffness: 300,
                                  damping: 20,
                                  staggerChildren: 0.1,
                                  delayChildren: 0.1,
                                },
                              },
                            }}
                          >
                            <div className={styles.navDropdownContent}>
                              <motion.div variants={{ hidden: { y: -20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                                <Link href="/messages/public" onClick={handleDropdownLinkClick}>
                                  <i className="bi bi-chat-dots-fill"></i> Public Messages
                                </Link>
                              </motion.div>
                              <motion.div variants={{ hidden: { y: -20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                                <Link href="/messages/send" onClick={handleDropdownLinkClick}>
                                <i className="bi bi-send-fill"></i> Send Message
                              </Link>
                              </motion.div>
                            </div>
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
                      <Link href="/learn" onClick={onClose}>
                        <i className="bi bi-book me-2"></i>Learn
                      </Link>
                    </li>
                    
                    {user && (
                      <li>
                        <Link href="/user/my-snippets" onClick={onClose}>
                          <i className="bi bi-file-earmark-code me-2"></i>My Snippets
                        </Link>
                      </li>
                    )}
                    
                    <li>
                      <div className={styles.offcanvasThemeToggleCard}>
                        <div className={styles.offcanvasThemeToggleContent}>
                          <AnimatePresence mode="wait" initial={false}>
                            {theme === 'light' ? (
                              <motion.span
                                key="light-mode"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                              >
                                <i className="bi bi-sun-fill me-2"></i>
                              </motion.span>
                            ) : (
                              <motion.span
                                key="dark-mode"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.2 }}
                              >
                                <i className="bi bi-moon-fill me-2"></i>
                              </motion.span>
                            )}
                          </AnimatePresence>
                          <span className={styles.offcanvasThemeToggleLabel}>
                            {theme === 'light' ? 'Light' : 'Dark'} Mode
                          </span>
                        </div>
                        <div className={styles.offcanvasThemeToggleSwitch} onClick={toggleTheme} data-theme={theme}>
                          <motion.div
                            className={styles.offcanvasThemeToggleHandle}
                            layout
                            transition={{ type: 'spring', stiffness: 700, damping: 30 }}
                          />
                        </div>
                      </div>
                    </li>
                  </ul>
                  {user?.permissions?.canAssignBadges && (
                    <div className={styles.adminNav}>
                      <p className={styles.adminNavLabel}>Admin Navigation</p>
                      <ul>
                        <li>
                          <Link href="/user/manage" onClick={onClose}>
                            <i className="bi bi-person-badge me-2"></i>Manage Users
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
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          variants={{
                            hidden: { opacity: 0, maxHeight: 0 },
                            visible: {
                              opacity: 1,
                              maxHeight: "500px",
                              transition: {
                                type: "spring",
                                stiffness: 300,
                                damping: 20,
                                staggerChildren: 0.1,
                                delayChildren: 0.1,
                                staggerDirection: -1,
                              },
                            },
                          }}
                        >
                          <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                            <Link href={`/user/${userData?.username || user.uid}`} onClick={handleDropdownLinkClick}>
                              <i className="bi bi-person-fill"></i> View Profile
                            </Link>
                          </motion.div>
                          <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                            <Link href="/user/settings" onClick={handleDropdownLinkClick}>
                              <i className="bi bi-gear-fill"></i> Settings
                            </Link>
                          </motion.div>
                          <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                            <button onClick={handleLogout}>
                              <i className="bi bi-box-arrow-right"></i> Logout
                            </button>
                          </motion.div>
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