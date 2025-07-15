'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function LearnPageClient({ allPostsData }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.ul variants={containerVariants}>
        {allPostsData.map(({ slug, title, date, description }) => (
          <motion.li
            key={slug}
            variants={itemVariants}
            style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid var(--border-color)' }}
          >
            <Link href={`/learn/${slug}`} style={{ textDecoration: 'none', color: '#0070f3', fontSize: '1.2em' }}>
              {title}
            </Link>
            <p style={{ margin: '5px 0', color: '#666' }}>{description}</p>
            <small style={{ color: '#666' }}>{new Date(date).toLocaleDateString()}</small>
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  );
}