"use client";
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export default function LandingPageContent() {
  const { user, loading } = useUser();

  const [particlesInitState, setParticlesInitState] = useState(false);
  
  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setParticlesInitState(true);
    });
    document.title = "Welcome to Luloy!";
  }, [user, loading]);

  const particlesOptions = useMemo(
    () => ({
      background: {
        color: {
          value: "transparent",
        },
      },
      fpsLimit: 120,
      fullScreen: {
        enable: false,
      },
      interactivity: {
        events: {
          onClick: {
            enable: false,
            mode: "push",
          },
          onHover: {
            enable: true,
            mode: "attract",
          },
        },
        modes: {
          push: {
            quantity: 1,
          },
          repulse: {
            distance: 200,
            duration: 0.4,
          },
        },
      },
      particles: {
        color: {
          value: "#007bff",
        },
        links: {
          color: "#007bff",
          distance: 150,
          enable: true,
          opacity: 0.5,
          width: 1,
        },
        move: {
          direction: "none",
          enable: true,
          outModes: {
            default: "bounce",
          },
          random: false,
          speed: 2,
          straight: false,
        },
        number: {
          density: {
            enable: true,
          },
          value: 30,
          max: 30,
        },
        opacity: {
          value: 0.5,
        },
        shape: {
          type: "star",
        },
        size: {
          value: {
            min: 1,
            max: 5
          },
        },
      },
      detectRetina: true,
    }),
    [],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container text-center py-5"
    >
      {/* Hero Section */}
      <div
        className="my-5 p-5 rounded-3"
        style={{ position: 'relative', height: '500px', overflow: 'hidden', backgroundColor: 'transparent' }}
      >
        {particlesInitState && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 0,
              width: '100%',
              height: '100vh',
              border: '1px solid transparent'
            }}
          >
            <Particles
              id="tsparticles"
              particlesLoaded={async (container) => {
              console.log("Particles container loaded", container);
            }}
              options={particlesOptions}
              style={{
                width: '100%',
                height: '500px',
                border: '1px solid red'
              }}
            />
          </div>
        )}
        <motion.div variants={itemVariants} style={{ position: 'relative', zIndex: 1 }} className="p-5 d-flex flex-column justify-content-start align-items-center h-100">
          <h1 className="display-3 fw-bold text-primary">Welcome to Luloy</h1>
          <p className="lead text-muted mt-3">
            Chat, learn, and share code with others.
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

      {/* Feature Highlights */}
      <motion.div variants={itemVariants} className="row my-5">
        <div className="col-md-4 mb-4">
          <motion.div whileHover={{ scale: 1.05, y: -10 }} className="card shadow-sm p-4 h-100">
            <i className="bi bi-shield-check display-4 mb-3 text-success"></i>
            <h3 className="card-title">Safe Chats</h3>
            <p className="card-text">Talk with friends in public or private messages.</p>
          </motion.div>
        </div>
        <div className="col-md-4 mb-4">
          <motion.div whileHover={{ scale: 1.05, y: -10 }} className="card shadow-sm p-4 h-100">
            <i className="bi bi-code-slash display-4 mb-3 text-info"></i>
            <h3 className="card-title">Share Code</h3>
            <p className="card-text">Show and discuss code with other developers.</p>
          </motion.div>
        </div>
        <div className="col-md-4 mb-4">
          <motion.div whileHover={{ scale: 1.05, y: -10 }} className="card shadow-sm p-4 h-100">
            <i className="bi bi-book-half display-4 mb-3 text-primary"></i>
            <h3 className="card-title">Learn</h3>
            <p className="card-text">Explore possible useful learning resources for various fields.</p>
          </motion.div>
        </div>
        <div className="col-md-4 mb-4">
          <motion.div whileHover={{ scale: 1.05, y: -10 }} className="card shadow-sm p-4 h-100">
            <i className="bi bi-people display-4 mb-3 text-warning"></i>
            <h3 className="card-title">Community</h3>
            <p className="card-text">Connect with people, make friends, and learn new things.</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Why Luloy? Section */}
      <motion.div variants={itemVariants} className="my-5 p-5 bg-light rounded-3">
        <h2 className="display-5 fw-bold">Why Luloy?</h2>
        <p className="lead text-muted mt-3">
          Luloy is a place for everyone to chat, learn, and share ideas. It's easy to use and a great way to meet new people.
        </p>
        <Link href="/messages/public" className="btn btn-primary btn-lg mt-4">
          See What's Happening
        </Link>
      </motion.div>

      
    </motion.div>
  );
}