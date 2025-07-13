'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '../../../../lib/firebase';
import { showToast } from '../../utils/toast';
import { motion } from 'framer-motion';
import Link from 'next/link';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [oobCode, setOobCode] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const code = searchParams.get('oobCode');
    if (!code) {
      setError('Invalid or missing password reset code.');
      setIsVerifying(false);
      return;
    }
    setOobCode(code);

    verifyPasswordResetCode(auth, code)
      .then(() => {
        setIsVerifying(false);
      })
      .catch((err) => {
        setError('Invalid or expired password reset code.');
        setIsVerifying(false);
      });
  }, [searchParams]);

  const handleResetPassword = async () => {
    if (!newPassword) {
      showToast('Please enter a new password.', 'error');
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      showToast('Password has been reset successfully!', 'success');
      router.push('/login');
    } catch (err) {
      showToast('Failed to reset password. Please try again.', 'error');
    }
  };

  if (isVerifying) {
    return <div>Verifying...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: 20 }} 
      transition={{ duration: 0.5 }}
      className="d-flex flex-column align-items-center justify-content-center px-3" style={{ minHeight: '80vh' }}
    >
      <div className="card m-2 text-center" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="card-body">
          <div className="text-center mb-4">
            <img src="/luloy.svg" alt="Luloy Logo" style={{ height: '3em', marginBottom: '1em' }} />
            <h2 className="card-title text-center"><i className="bi bi-key me-2"></i>Reset Password</h2>
          </div>
          
          {isVerifying && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 10 }} 
              transition={{ duration: 0.3 }}
              className="alert alert-info d-flex align-items-center justify-content-center" role="alert"
            >
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Verifying password reset code...
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 10 }} 
              transition={{ duration: 0.3 }}
              className="alert alert-danger" role="alert"
            >
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
              <div className="d-grid gap-2 mt-3">
                <Link href="/login" className="btn btn-primary">
                  <i className="bi bi-box-arrow-in-right me-2"></i>Go to Login
                </Link>
              </div>
            </motion.div>
          )}

          {!isVerifying && !error && (
            <>
              <div className="form-floating mb-3">
                <input type="password" className="form-control" id="newPasswordInput" placeholder="New Password" onChange={(e) => setNewPassword(e.target.value)} />
                <label htmlFor="newPasswordInput">New Password</label>
              </div>
              <div className="d-grid gap-2">
                <button className="btn btn-primary" onClick={handleResetPassword}>Reset Password</button>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
