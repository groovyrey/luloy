'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useUser } from '../context/UserContext';
import LoadingMessage from '../components/LoadingMessage';
import styles from './ArchivePage.module.css';

export default function ArchivePageClient({ allOfficialPostsData }) {
  const { user, userData, loading } = useUser();
  const [posts, setPosts] = useState(allOfficialPostsData);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10,
      },
    },
  };

  if (loading) {
    return <LoadingMessage />;
  }

  const isStaff = user && userData && userData.badges && userData.badges.includes('staff');

  return (
    <div>
      {isStaff && (
        <div className="text-center mb-4">
          <Link href="/upload/upload-post" className="btn btn-primary">
            <i className="bi-cloud-arrow-up"></i> Upload Post
          </Link>
          <p className="text-muted mt-2">Posts support Markdown text formatting. Learn more about <a href="https://www.markdownguide.org/basic-syntax/" target="_blank" rel="noopener noreferrer" className="text-primary">Markdown syntax</a>.</p>
        </div>
      )}
      
      {posts.length === 0 ? (
        <div className="text-center text-muted fst-italic mt-4">
          <p className="mb-0">No posts found yet.</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={styles.cardGrid}
        >
          {posts.map(({ slug, title, date, description }) => (
            <motion.div key={slug} variants={itemVariants} className={styles.cardWrapper}>
              <Link href={`/archive/${slug}`} className={styles.cardLink}>
                <div className={styles.card}>
                  <h5 className={styles.cardTitle}>{title}</h5>
                  <p className={styles.cardDescription}>{description}</p>
                  <small className={styles.cardDate}>{new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</small>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
