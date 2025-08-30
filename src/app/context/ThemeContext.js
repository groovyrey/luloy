'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {},
  syntaxHighlighterTheme: oneDark,
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [syntaxHighlighterTheme, setSyntaxHighlighterTheme] = useState(oneDark);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(storedTheme);
    setSyntaxHighlighterTheme(storedTheme === 'dark' ? oneDark : oneLight);
    document.body.setAttribute('data-theme', storedTheme);
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setSyntaxHighlighterTheme(newTheme === 'dark' ? oneDark : oneLight);
    localStorage.setItem('theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, syntaxHighlighterTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
