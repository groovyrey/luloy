'use client';

import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "/lib/firebase.js";
import { useRouter } from "next/navigation";
import { useUser } from '../context/UserContext';
import LoadingMessage from '../components/LoadingMessage';
import { motion } from "framer-motion";
import { showToast } from '../utils/toast';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    document.title = "Sign Up";
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleSignup = async () => {
    setIsSigningUp(true);
    try {
      if (!firstName || !lastName || !age || !email || !password) {
        showToast("Please fill in all fields.", 'error');
        setIsSigningUp(false);
        return;
      }

      // Frontend Validations
      if (firstName.length < 2 || firstName.length > 50 || !/^[a-zA-Z]+$/.test(firstName)) {
        showToast("First name must be 2-50 alphabetic characters.", 'error');
        setIsSigningUp(false);
        return;
      }
      if (lastName.length < 2 || lastName.length > 50 || !/^[a-zA-Z]+$/.test(lastName)) {
        showToast("Last name must be 2-50 alphabetic characters.", 'error');
        setIsSigningUp(false);
        return;
      }
      const parsedAge = parseInt(age);
      if (isNaN(parsedAge) || parsedAge < 13 || parsedAge > 120) {
        showToast("Age must be a number between 13 and 120.", 'error');
        setIsSigningUp(false);
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast("Please enter a valid email address.", 'error');
        setIsSigningUp(false);
        return;
      }
      if (password.length < 8) {
        showToast("Password must be at least 8 characters long.", 'error');
        setIsSigningUp(false);
        return;
      }
      // You can add more complex password validation (e.g., requiring numbers, symbols) here if needed.

      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });
      
      const idToken = await user.getIdToken();

      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken, firstName, lastName, age: parseInt(age) }),
      });

      if (res.ok) {
        const sessionRes = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idToken }),
        });
        if (sessionRes.ok) {
          router.push('/');
        } else {
          showToast('Failed to create session.', 'error');
        }
      } else {
        const errorData = await res.json();
        showToast(errorData.error || 'Failed to save user data.', 'error');
      }
    } catch (err) {
      let errorMessage = 'Signup failed. Please try again.';
      if (err.code) {
        switch (err.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'The email address is already in use by another account.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'The email address is not valid.';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'Email/password accounts are not enabled. Enable email/password in the Firebase console.';
            break;
          case 'auth/weak-password':
            errorMessage = 'The password is too weak.';
            break;
          default:
            errorMessage = `Signup failed: ${err.message}`;
            break;
        }
      }
      showToast(errorMessage, 'error');
    } finally {
      setIsSigningUp(false);
    }
  };

  if (loading) {
    return <LoadingMessage />;
  }

  if (user) {
    return <LoadingMessage />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: 20 }} 
      transition={{ duration: 0.5 }}
      className="d-flex flex-column align-items-center justify-content-center px-3" style={{ minHeight: '80vh' }}
    >
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="card-header">
          <img src="/luloy.svg" alt="Luloy Logo" className="mb-3" style={{ height: '4.5em' }} />
          <h2 className="card-title fw-bold mb-0 fs-3"><i className="bi bi-person-plus-fill me-2"></i>Sign Up</h2>
          <p className="mb-0 opacity-75">Create your account</p>
        </div>
        <div className="card-body">
          
          <div className="form-floating mb-3">
            <input type="text" className="form-control" id="firstNameInput" onChange={e => setFirstName(e.target.value)} />
            <label htmlFor="firstNameInput"><i className="bi bi-person me-2"></i>First Name</label>
          </div>
          <div className="form-floating mb-3">
            <input type="text" className="form-control" id="lastNameInput" onChange={e => setLastName(e.target.value)} />
            <label htmlFor="lastNameInput"><i className="bi bi-person me-2"></i>Last Name</label>
          </div>
          <div className="form-floating mb-3">
            <input type="number" className="form-control" id="ageInput" onChange={e => setAge(e.target.value)} />
            <label htmlFor="ageInput"><i className="bi bi-calendar me-2"></i>Age</label>
          </div>
          <div className="form-floating mb-3">
            <input type="email" className="form-control" id="emailInput" onChange={e => setEmail(e.target.value)} />
            <label htmlFor="emailInput"><i className="bi bi-envelope me-2"></i>Email</label>
          </div>
          <div className="form-floating mb-3">
            <input type="password" className="form-control" id="passwordInput" onChange={e => setPassword(e.target.value)} />
            <label htmlFor="passwordInput"><i className="bi bi-lock me-2"></i>Password</label>
          </div>
          <div className="d-grid gap-2">
            <button className="btn btn-primary" onClick={handleSignup} disabled={isSigningUp}>
              {isSigningUp ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                <i className="bi-person-plus me-2"></i>
              )}{' '}{isSigningUp ? 'Signing up...' : 'Sign Up'}
            </button>
          </div>
          <p className="mt-3 text-center">Already have an account? <a className="text-primary" href="/login"><i className="bi bi-box-arrow-in-right me-2"></i>Login</a></p>
          
        </div>
      </div>
    </motion.div>
  );
}
