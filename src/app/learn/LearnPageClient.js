'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function LearnPageClient({ allOfficialPostsData, userPostsData: initialUserPostsData }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Adjust as needed for desired stagger effect
        delayChildren: 0.2, // Delay before children start animating
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

  return (
    <div>
      <h2 className="text-2xl font-bold mt-8 mb-4 text-primary">Official Learning Resources</h2>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="row g-4"
      >
        {allOfficialPostsData.map(({ slug, title, date, description }) => (
          <div key={slug} className="col-md-6 mb-4">
            <motion.div variants={itemVariants}>
            <Link href={`/learn/${slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card mb-3">
                <div className="card-body">
                  <h5 className="card-title mb-2 text-primary">{title}</h5>
                  <p className="mb-1">{description}</p>
                  <small className="text-muted">{new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' })}</small>
                </div>
              </div>
            </Link>
          </motion.div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
