'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BADGES } from '../utils/BadgeSystem';
import ReactIconRenderer from '../components/ReactIconRenderer';

export default function BadgesPage() {
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

  return (
    <div className="container py-5">
      <h1 className="display-4 text-center mb-5">All Badges</h1>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="row justify-content-center"
      >
        {Object.keys(BADGES).map((badgeKey) => {
          const badge = BADGES[badgeKey];
          return (
            <motion.div key={badgeKey} className="col-md-4 mb-4" variants={itemVariants}>
              <div className="card h-100 shadow-sm d-flex flex-column justify-content-between">
                <div className="card-body text-center">
                  <div className={`mb-3 ${badge.color}`}>
                    <ReactIconRenderer IconComponent={badge.icon} size={60} color={badge.color} />
                  </div>
                  <h5 className="card-title">{badge.name}</h5>
                  <p className="card-text text-muted">{badge.description}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
