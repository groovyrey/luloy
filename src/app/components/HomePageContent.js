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
          {user?.permissions?.canManageUsers && (
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

      {/* New Section: Learning Zone */}
      <div className="mt-5 w-100" style={{ maxWidth: '800px' }}>
        <h2 className="h3 fw-semibold text-secondary mb-4 text-center">Learning Zone</h2>
        <div className="row g-4">
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title text-primary">Introduction to Data Structures & Algorithms</h5>
                <p className="card-text text-muted flex-grow-1">Get started with the fundamental concepts of data structures and algorithms.</p>
                <Link href="/learn/data-structures-algorithms-introduction" className="btn btn-outline-primary mt-auto">
                  Read More <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title text-primary">Object-Oriented Programming in Java</h5>
                <p className="card-text text-muted flex-grow-1">Explore the core principles of OOP using Java with real-world examples.</p>
                <Link href="/learn/object-oriented-programming-java" className="btn btn-outline-primary mt-auto">
                  Read More <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title text-primary">Introduction to SQL</h5>
                <p className="card-text text-muted flex-grow-1">Learn the basics of SQL for managing and querying relational databases.</p>
                <Link href="/learn/introduction-to-sql" className="btn btn-outline-primary mt-auto">
                  Read More <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card h-100 text-center">
              <div className="card-body d-flex flex-column justify-content-center">
                 <h5 className="card-title">Explore More</h5>
                 <p className="card-text text-muted">Visit the learn page for more articles.</p>
                <Link href="/learn" className="btn btn-primary mt-3">
                  Go to Learn Page <i className="bi bi-book"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

    </motion.div>
  );
}