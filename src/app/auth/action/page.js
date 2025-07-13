'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '../../../../lib/firebase';
import { showToast } from '../../utils/toast';

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
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="card m-2" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="card-body">
          <h2 className="card-title text-center mb-4">Reset Password</h2>
          <div className="form-floating mb-3">
            <input type="password" className="form-control" id="newPasswordInput" placeholder="New Password" onChange={(e) => setNewPassword(e.target.value)} />
            <label htmlFor="newPasswordInput">New Password</label>
          </div>
          <div className="d-grid gap-2">
            <button className="btn btn-primary" onClick={handleResetPassword}>Reset Password</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
