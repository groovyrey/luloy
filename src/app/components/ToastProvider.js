'use client';

import { Toaster } from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

export default function ToastProvider() {
  const { theme } = useTheme();

  return (
    <Toaster
      toastOptions={{
        style: {
          borderRadius: '10px',
          background: theme === 'dark' ? '#333' : '#fff',
          color: theme === 'dark' ? '#fff' : '#333',
        },
      }}
    />
  );
}