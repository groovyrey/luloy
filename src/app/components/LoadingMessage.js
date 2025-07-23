'use client';

import React, { useState, useEffect } from 'react';
import Lottie from 'react-lottie';
import { motion } from 'framer-motion';
import animationData from '../../../public/loading_animation.json'; // Adjust path as needed

import { useTheme } from '../context/ThemeContext'; // Import useTheme

const LoadingMessage = () => {
  const { theme } = useTheme(); // Get current theme
  const [currentAnimationData, setCurrentAnimationData] = useState(animationData);

  useEffect(() => {
    const rootStyles = getComputedStyle(document.documentElement);
    const primaryColorHex = rootStyles.getPropertyValue('--primary-color').trim();

    // Function to convert hex to normalized RGB
    const hexToRgbNormalized = (hex) => {
      let r = 0, g = 0, b = 0;
      // Handle #RRGGBB or #RGB
      if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
      } else if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
      }
      return [r / 255, g / 255, b / 255, 1]; // Add alpha of 1
    };

    const newColor = hexToRgbNormalized(primaryColorHex);

    // Deep copy and modify animationData
    const updatedAnimationData = JSON.parse(JSON.stringify(animationData));
    updatedAnimationData.layers.forEach(layer => {
      if (layer.shapes) {
        layer.shapes.forEach(shape => {
          if (shape.it) {
            shape.it.forEach(item => {
              if (item.ty === 'fl' && item.c && item.c.k) {
                item.c.k = newColor;
              }
            });
          }
        });
      }
    });
    setCurrentAnimationData(updatedAnimationData);
  }, [theme]); // Re-run when theme changes

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: currentAnimationData, // Use dynamic animation data
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const lottieVariants = {
    pulse: {
      scale: [1, 1.02, 1],
      opacity: [0.9, 1, 0.9],
      transition: {
        duration: 1.8,
        repeat: Infinity,
        ease: "easeInOut",
        repeatType: "mirror",
      },
    },
  };

  return (
    <motion.div
      className="d-flex justify-content-center align-items-center"
      style={{ height: '100vh' }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="text-center"
        variants={lottieVariants}
        animate="pulse"
      >
        <Lottie options={defaultOptions} style={{ width: 200, height: 200 }} />
      </motion.div>
    </motion.div>
  );
};

export default LoadingMessage;
