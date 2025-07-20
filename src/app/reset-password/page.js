'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { showToast } from '../utils/toast';
import { motion } from "framer-motion";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    document.title = "Reset Password";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast('Password reset link sent to your email!', 'success');
        router.push('/login'); // Redirect to login after sending the link
      } else {
        showToast(data.error || 'Failed to send password reset link.', 'error');
      }
    } catch (err) {
      showToast('An unexpected error occurred.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h2 className="card-title fw-bold mb-0 fs-3">Reset Password</h2>
          <p className="mb-0 opacity-75">Enter your email to reset your password</p>
        </div>
        <div className="card-body">
          
          <form onSubmit={handleSubmit}>
            <div className="form-floating mb-3">
              <input 
                type="email" 
                className="form-control" 
                id="emailInput" 
                placeholder="Email" 
                value={email}
                onChange={e => setEmail(e.target.value)} 
                required 
              />
              <label htmlFor="emailInput"><i className="bi bi-envelope me-2"></i>Email</label>
            </div>
            <div className="d-grid gap-2">
              <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  <i className="bi bi-send me-2"></i>
                )}{' '}
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </form>
          <p className="mt-3 text-center">Remember your password? <a className="text-primary" href="/login">Login</a></p>
        </div>
      </div>
    </motion.div>
  );
}