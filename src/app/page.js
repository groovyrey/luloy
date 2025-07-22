"use client";
import { useEffect, useState } from 'react';
import { useUser } from './context/UserContext';
import HomePageContent from './components/HomePageContent';
import LandingPageContent from './components/LandingPageContent';
import LoadingMessage from './components/LoadingMessage';

export default function Home() {
  const { user, loading } = useUser();
  

  useEffect(() => {
    document.title = loading ? "Loading..." : (user ? "Home" : "Welcome to Luloy!");
  }, [user, loading]);

  if (loading) {
    return <LoadingMessage />;
  }

  return (
    <div>
      {user ? <HomePageContent /> : <LandingPageContent />}
      
    </div>
  );
}