'use client';

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "/lib/firebase.js";
import { useRouter } from "next/navigation";
import { useUser } from '../context/UserContext';
import LoadingMessage from '../components/LoadingMessage';
import { showToast } from '../utils/toast';
import { motion } from "framer-motion";

export default function LoginPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
	const router = useRouter();
  const { user, loading, login } = useUser();

  useEffect(() => {
    document.title = "Login";
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);
	
	const handleLogin = async () => {
    
    setIsLoggingIn(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      // Error handling is now done in UserContext.js
    } finally {
      setIsLoggingIn(false);
    }
  };

  

  
	
  if (loading) {
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
            <h2 className="card-title text-center"><i className="bi bi-person-circle me-2"></i>Login</h2>
          </div>
          
          <div className="form-floating mb-3">
            <input type="email" className="form-control" id="emailInput" onChange={e => setEmail(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }} />
            <label htmlFor="emailInput"><i className="bi bi-envelope me-2"></i>Email</label>
          </div>
          <div className="form-floating mb-3">
            <input type="password" className="form-control" id="passwordInput" onChange={e => setPassword(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }} />
            <label htmlFor="passwordInput"><i className="bi bi-lock me-2"></i>Password</label>
          </div>
          <div className="d-grid gap-2">
            <button className="btn btn-primary" onClick={handleLogin} disabled={isLoggingIn}>
              {isLoggingIn ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                <i className="bi-box-arrow-in-right me-2"></i>
              )}{' '}
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </button>
            
          </div>
          <p className="mt-3 text-center">Don't have an account? <a className="text-primary" href="/signup"><i className="bi bi-person-plus me-2"></i>Sign up</a></p>
          <p className="mt-3 text-center"><a className="text-primary" href="/reset-password"><i className="bi bi-key me-2"></i>Forgot Password?</a></p>
        </div>
      </div>
    </motion.div>
  );
}