'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { showToast } from '../utils/toast';
import { motion } from "framer-motion";
import Link from 'next/link';
import ResetPasswordLayout from '../components/ResetPasswordLayout';
import formStyles from '../components/AuthForm.module.css';

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
                router.push('/login');
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
        <ResetPasswordLayout
            title="Reset Password"
            subtitle="Enter your email to receive a password reset link."
        >
            <form onSubmit={handleSubmit}>
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <div className="form-floating mb-3">
                        <input
                            type="email"
                            className="form-control"
                            id="emailInput"
                            placeholder=" "
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                        <label htmlFor="emailInput"><i className="bi bi-envelope me-2"></i>Email</label>
                    </div>
                </motion.div>
                <motion.div>
                    <div className="d-grid gap-2">
                        <button className={`btn btn-primary ${formStyles.authButton}`} type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            ) : (
                                <i className="bi bi-send me-2"></i>
                            )}
                            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </div>
                </motion.div>
            </form>
            <p className="mt-3 text-center">
                Remember your password? <Link href="/login" className={formStyles.authLink}>Login</Link>
            </p>
        </ResetPasswordLayout>
    );
}