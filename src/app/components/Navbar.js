'use client';

import Link from 'next/link';
import { useUser } from '../context/UserContext';
import { useState } from 'react';
import Offcanvas from './Offcanvas';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Navbar.module.css';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, userData, logout, loading } = useUser();
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const toggleOffcanvas = () => {
    setIsOffcanvasOpen(!isOffcanvasOpen);
  };

  return (
    <motion.header 
      className={styles.navbarGrid}
    >
      <div className={styles.navbarBrandContainer}>
        <Link href="/">
          <img src="/luloy.svg" alt="Luloy Logo" style={{ height: '1.5em', marginRight: '0.5em' }} />
        </Link>
        
      </div>
      <button
        className={`${styles.mobileMenuToggle} ${isOffcanvasOpen ? styles.open : ''}`}
        onClick={toggleOffcanvas}
        aria-label="Toggle menu"
      >
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
      </button>
      <Offcanvas isOpen={isOffcanvasOpen} onClose={toggleOffcanvas} />
    </motion.header>
  );
}