'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '/lib/firebase';
import { getComputedPermissions } from '../utils/BadgeSystem';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [allUsersData, setAllUsersData] = useState({});
  const fetchingUsers = useRef(new Set()); // To track users currently being fetched
  const [loading, setLoading] = useState(true);

  // Helper function to fetch user data
  const fetchUserData = async (uid) => {
    try {
      const res = await fetch(`/api/user/${uid}`);
      if (res.ok) {
        const data = await res.json();
        
        return data;
      } else {
        const errorText = await res.text();
        showToast(`Failed to fetch user data from API: ${errorText || 'Unknown error'}`, 'error');
        return null;
      }
    } catch (error) {
      showToast(`Error fetching user data: ${error instanceof Error ? error.message : String(error)}`, 'error');
      return null;
    }
  };

  const fetchAndStoreUserData = async (uid) => {
    if (allUsersData[uid] || fetchingUsers.current.has(uid)) {
      return;
    }

    fetchingUsers.current.add(uid);
    try {
      const data = await fetchUserData(uid);
      if (data) {
        setAllUsersData(prevData => ({ ...prevData, [uid]: data }));
      }
    } finally {
      fetchingUsers.current.delete(uid);
    }
  };

  // Function to refresh user data, exposed via context
  const refreshUserData = async () => {
    if (user) {
      const fetchedUserData = await fetchUserData(user.uid);
      if (fetchedUserData) {
        setUserData(fetchedUserData);
        setAllUsersData(prevData => ({ ...prevData, [user.uid]: fetchedUserData }));
      }
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        throw new Error('Failed to create session.');
      }
      showToast('Logged in successfully!', 'success');
    } catch (error) {
      showToast(`Login failed: ${error instanceof Error ? error.message : String(error)}`, 'error');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/logout');
      await signOut(auth);
    } catch (error) {
      showToast(`Logout failed: ${error instanceof Error ? error.message : String(error)}`, 'error');
      throw error;
    }
  };

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          // Fetch user data from Firestore via API
          const fetchedUserData = await fetchUserData(currentUser.uid);
          if (fetchedUserData) {
            setUserData(fetchedUserData);
            setAllUsersData(prevData => ({ ...prevData, [currentUser.uid]: fetchedUserData }));
          } else {
            setUserData(null);
          }

          const userBadges = fetchedUserData ? fetchedUserData.badges || [] : [];
          const userPermissions = getComputedPermissions(userBadges);

          // Construct the user object with badges and permissions
          const userObject = {
            ...currentUser,
            idToken: await currentUser.getIdToken(), // Get the latest ID token
            badges: userBadges,
            permissions: userPermissions,
          };
          setUser(userObject);
        } else {
          setUser(null);
          setUserData(null);
        }
        setLoading(false);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, userData, allUsersData, loading, login, logout, refreshUserData, fetchAndStoreUserData }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  
  return context;
}