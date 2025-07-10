"use client";
import { useEffect } from 'react';

import { useUser } from '../context/UserContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
// Import any other components like MessageCard if you want to reuse them for feature highlights

export default function LandingPageContent() {
  const { user, loading } = useUser();
  

  useEffect(() => {
    
    document.title = "Welcome to Luloy!";
  }, [user, loading]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container text-center py-5"
    >
      {/* Hero Section */}
      <div className="my-5">
        <h1 className="display-4 fw-bold text-primary">Welcome to Luloy!</h1>
        <p className="lead text-muted mt-3">Connect, Share, and Communicate Securely.</p>
        <div className="d-grid gap-2 col-md-6 mx-auto mt-4">
          <Link href="/login" className="btn btn-primary btn-lg">
            Get Started
          </Link>
          <Link href="/signup" className="btn btn-outline-secondary btn-lg">
            Sign Up
          </Link>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="row my-5">
        <div className="col-md-4">
          <motion.div whileHover={{ scale: 1.05 }} className="card shadow-sm p-4 mb-4">
            <i className="bi bi-chat-dots display-4 mb-3" style={{ color: 'var(--success-color)' }}></i>
            <h3 className="card-title">Secure Messaging</h3>
            <p className="card-text">Send and receive messages privately or publicly with ease.</p>
          </motion.div>
        </div>
        <div className="col-md-4">
          <motion.div whileHover={{ scale: 1.05 }} className="card shadow-sm p-4 mb-4">
            <i className="bi bi-person-circle display-4 mb-3" style={{ color: 'var(--info-color)' }}></i>
            <h3 className="card-title">User Management</h3>
            <p className="card-text">Manage your profile, settings, and connect with other users.</p>
          </motion.div>
        </div>
        <div className="col-md-4">
          <motion.div whileHover={{ scale: 1.05 }} className="card shadow-sm p-4 mb-4">
            <i className="bi bi-phone display-4 mb-3" style={{ color: 'var(--warning-color)' }}></i>
            <h3 className="card-title">Responsive Design</h3>
            <p className="card-text">Enjoy a seamless and intuitive experience on any device.</p>
          </motion.div>
        </div>
      </div>

      {/* Optional: Another Call to Action */}
      <div className="my-5">
        <p className="lead">Ready to start connecting?</p>
        <Link href="/messages/public" className="btn btn-outline-primary btn-lg">
          Explore Public Messages
        </Link>
      </div>
    </motion.div>
  );
}