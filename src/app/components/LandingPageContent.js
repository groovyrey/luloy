"use client";
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LandingPageContent() {
  const { user, loading } = useUser();

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  useEffect(() => {
    document.title = "Welcome to Luloy!";
  }, [user, loading]);

  return (
    <motion.div
      className="container text-center py-5"
    >
      {/* Hero Section */}
      <div
        className="my-5 p-3 rounded-3"
        style={{ position: 'relative', height: '500px', overflow: 'hidden', backgroundColor: 'transparent' }}
      >
        <motion.div variants={itemVariants} style={{ position: 'relative', zIndex: 1 }} className="p-5 d-flex flex-column justify-content-start align-items-center h-100">
          <h1 className="display-3 fw-bold text-primary">Welcome to Luloy</h1>
          <p className="lead text-muted mt-3">
            Luloy is a place for developers and tech fans to connect, share code, and learn.
          </p>
          <div className="d-grid gap-2 col-md-6 mx-auto mt-4">
            <Link href="/login" className="btn btn-primary btn-lg">
              Login
            </Link>
            <Link href="/signup" className="btn btn-outline-secondary btn-lg">
              Create Account
            </Link>
          </div>
        </motion.div>
      </div>

      

      {/* Why Luloy? Section */}
      <motion.div variants={itemVariants} className="my-5 p-5 rounded-3">
        <h2 className="display-5 fw-bold">Why Luloy?</h2>
        <p className="lead text-muted mt-3">
          Luloy mixes social sharing with tech work. Share your projects, get ideas, and learn from others. If you're new or a pro, Luloy helps you grow.
        </p>
        <Link href="/guestbook?tab=public" className="btn btn-primary btn-lg mt-4">
          See What's Happening
        </Link>
      </motion.div>

      
    </motion.div>
  );
}