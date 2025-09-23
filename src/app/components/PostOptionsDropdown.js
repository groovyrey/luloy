'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './SnippetOptionsDropdown.module.css';

export default function PostOptionsDropdown({
  isStaff,
  onShare,
  onDelete,
  theme,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleButtonClick = (action) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className={styles.dropdownContainer} data-theme={theme}>
      <button className={`btn btn-sm btn-outline-secondary ${styles.dropdownToggle}`} onClick={() => setIsOpen(!isOpen)}>
        <i className="bi bi-three-dots-vertical"></i>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.dropdownMenu}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              hidden: { opacity: 0, scale: 0.95, y: -10 },
              visible: {
                opacity: 1,
                scale: 1,
                y: 0,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  staggerChildren: 0.05,
                  delayChildren: 0.05,
                },
              },
            }}
          >
            <motion.div variants={{ hidden: { y: -10, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
              <button onClick={() => handleButtonClick(onShare)}>
                <i className="bi bi-share"></i> Share Post
              </button>
            </motion.div>
            {isStaff && (
              <motion.div variants={{ hidden: { y: -10, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                <button onClick={() => handleButtonClick(onDelete)}>
                  <i className="bi bi-trash"></i> Delete Post
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
