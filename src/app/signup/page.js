'use client';

import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "/lib/firebase.js";
import { useRouter } from "next/navigation";
import { useUser } from '../context/UserContext';
import LoadingMessage from '../components/LoadingMessage';
import { motion } from "framer-motion";
import { showToast } from '../utils/toast';

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
      showToast("Signup failed: " + err.message, 'error');
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
      <div className="card m-2" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="card-body">
          <div className="text-center mb-4">
            <img src="/luloy.svg" alt="Luloy Logo" style={{ height: '3em', marginBottom: '1em' }} />
            <h2 className="card-title text-center"><i className="bi bi-person-plus-fill me-2"></i>Sign Up</h2>
          </div>
          
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
