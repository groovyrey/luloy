'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './SnippetOptionsDropdown.module.css';

export default function SnippetOptionsDropdown({
  snippetId,
  isOwner,
  onCopy,
  onShare,
  onDelete,
  theme,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

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
              <button onClick={() => handleButtonClick(onCopy)}>
                <i className="bi bi-clipboard"></i> Copy Code
              </button>
            </motion.div>
            <motion.div variants={{ hidden: { y: -10, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
              <button onClick={() => handleButtonClick(onShare)}>
                <i className="bi bi-share"></i> Share Snippet
              </button>
            </motion.div>
            {isOwner && (
              <>
                <motion.div variants={{ hidden: { y: -10, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                  <Link href={`/code-snippets/${snippetId}/edit`} onClick={handleLinkClick}>
                    <i className="bi bi-pencil"></i> Edit Snippet
                  </Link>
                </motion.div>
                <motion.div variants={{ hidden: { y: -10, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                  <button onClick={() => handleButtonClick(onDelete)}>
                    <i className="bi bi-trash"></i> Delete Snippet
                  </button>
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
