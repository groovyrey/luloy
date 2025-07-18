'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link'; // Import Link for navigation

import { useUser } from '../context/UserContext';
import { motion } from 'framer-motion';
import LoadingMessage from '../components/LoadingMessage';
import { gsap } from 'gsap';


export default function HomePageContent() {
  const { user, loading, userData } = useUser();
  
  const welcomeRef = useRef(null);

  useEffect(() => {
    document.title = "Home";
    

    if (welcomeRef.current) {
      gsap.fromTo(
        welcomeRef.current,
        { opacity: 0, y: -50, filter: "blur(10px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 1, ease: "power3.out" }
      );
    }
  }, [user, loading]);

  if (loading) {
    return <LoadingMessage />;
  }

  if (!user) {
    return null; // Or a message like "Please log in to view this page."
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="d-flex flex-column align-items-center justify-content-center min-vh-100 w-100 p-4"
    >
      <h1
        ref={welcomeRef}
        className="display-4 fw-bold text-primary mb-4 text-center"
      >
        Welcome, {userData?.firstName || user?.email || 'User'}!
      </h1>
      <p className="lead text-muted mt-3 text-center">Your space to connect and share.</p>

      {/* New Section: Quick Actions */}
      <div className="mt-5 text-center">
        <h2 className="h3 fw-semibold text-secondary mb-3">Quick Actions</h2>
        <div className="d-flex flex-wrap justify-content-center gap-3">
          <Link href="/messages/send" className="btn btn-primary">
            <i className="bi bi-send me-2"></i> Send a Message
          </Link>
          <Link href="/messages/public" className="btn btn-outline-primary">
            <i className="bi bi-globe me-2"></i> View Public Messages
          </Link>
          {userData?.authLevel === 1 && (
            <>
              <Link href="/user/search" className="btn btn-outline-info">
                <i className="bi bi-people me-2"></i> Manage Users
              </Link>
              <Link href="/messages/private" className="btn btn-outline-info">
                <i className="bi bi-lock me-2"></i> Review Private Messages
              </Link>
              {/* Add more admin-specific links here */}
            </>
          )}
        </div>
      </div>

      {/* New Section: Recent Activity (Placeholder) */}
      <div className="mt-5 text-center w-100" style={{ maxWidth: '800px' }}>
        <h2 className="h3 fw-semibold text-secondary mb-3">Your Recent Activity</h2>
        <div className="card p-4">
          <p className="text-muted">
            (This section could display your latest messages, interactions, or notifications.
            You would fetch this data from your database.)
          </p>
          {/* Example: Display a few recent messages */}
          {/* <div className="text-start mt-4">
            <p><strong>Message 1:</strong> "Hello world!" - 2 hours ago</p>
            <p><strong>Message 2:</strong> "Checking in." - 1 day ago</p>
          </div> */}
        </div>
      </div>

    </motion.div>
  );
}