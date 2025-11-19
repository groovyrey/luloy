// src/app/ry/page.js
'use client';
import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import Lottie from 'react-lottie';
import Confetti from 'react-confetti';
import styles from './BirthdayPage.module.css';
import animationData from '../../../public/hbd.json';

const BirthdayPage = () => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
  }, []);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  const handleButtonClick = () => {
    setShowMessage(true);
    setShowConfetti(true);
  };

  const handleConfettiComplete = () => {
    setShowConfetti(false);
  };

  return (
    <div className={styles.container}>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          onConfettiComplete={handleConfettiComplete}
        />
      )}
      <main className={styles.card}>
            <img src="/birthday/birthday-cake.png" alt="Birthday Cake" className={styles.birthdayCake} />
            <img src="/birthday/birthday.png" alt="Birthday" className={styles.birthdayImage} />
        <h1 className={styles.title}>Happy 20th Birthday, Ry!</h1>
        {showMessage && (
          <div className={styles.messageContainer}>
            <p className={styles.message}>Happy birthday, Ry! Hope you have an absolutely amazing day filled with so much joy, laughter, and wonderful memories that you'll cherish forever. Wishing you all the best on your special day!</p>
            
          </div>
        )}
        <Lottie options={defaultOptions} height={200} width={200} />
        <motion.button
          className={styles.button}
          onClick={handleButtonClick}
          whileHover={{ scale: 1.1, rotate: 5 }}
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 2, -2, 0]
          }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "loop"
          }}
        >
          Click Me!
        </motion.button>
      </main>
    </div>
  );
};

export default BirthdayPage;
