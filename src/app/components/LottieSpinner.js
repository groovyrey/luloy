'use client';

import React from 'react';
import Lottie from 'react-lottie-player';
import lottieJson from '../../../public/loading_spinner_dots.json';

export default function LottieSpinner({ width = 100, height = 100 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
      <Lottie
        loop
        animationData={lottieJson}
        play
        style={{ width, height }}
      />
    </div>
  );
}
