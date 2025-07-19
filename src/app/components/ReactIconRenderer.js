'use client';

import React from 'react';

export default function ReactIconRenderer({ IconComponent, size = 24, color = 'currentColor' }) {
  if (!IconComponent) {
    console.warn(`Icon component is undefined.`);
    return null; // Or a fallback icon
  }

  return <IconComponent size={size} color={color} />;
}
