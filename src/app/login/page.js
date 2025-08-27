'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from '../context/UserContext';
import LoadingMessage from '../components/LoadingMessage';
import { motion } from "framer-motion";
import Link from 'next/link';
import AuthLayout from '../components/AuthLayout';
import formStyles from '../components/AuthForm.module.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const router = useRouter();
    const { user, loading, login } = useUser();

    useEffect(() => {
        document.title = "Login";
        if (!loading && user) {
            router.push('/');
        }
    }, [user, loading, router]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoggingIn(true);
        try {
            await login(email, password);
            router.push('/');
        } catch (err) {
            // Error handling is in UserContext
        } finally {
            setIsLoggingIn(false);
        }
    };

    if (loading) {
        return <LoadingMessage />;
    }

    return (
        <AuthLayout
            title="Login"
            subtitle="Enter your credentials to access your account."
            brandingTitle="Welcome Back"
            brandingSubtitle="Sign in to continue your journey with Luloy."
        >
            <form onSubmit={handleLogin}>
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
                        />
                        <label htmlFor="emailInput"><i className="bi bi-envelope me-2"></i>Email</label>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                >
                    <div className="form-floating mb-3">
                        <input
                            type="password"
                            className="form-control"
                            id="passwordInput"
                            placeholder=" "
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        <label htmlFor="passwordInput"><i className="bi bi-lock me-2"></i>Password</label>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                >
                    <div className="d-grid gap-2">
                        <button className={`btn btn-primary ${formStyles.authButton}`} type="submit" disabled={isLoggingIn}>
                            {isLoggingIn ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            ) : (
                                <i className="bi-box-arrow-in-right me-2"></i>
                            )}
                            {isLoggingIn ? 'Logging in...' : 'Login'}
                        </button>
                    </div>
                </motion.div>
            </form>
            <p className="mt-3 text-center">
                Don't have an account? <Link href="/signup" className={formStyles.authLink}><i className="bi bi-person-plus me-2"></i>Sign up</Link>
            </p>
            <p className="mt-2 text-center">
                <Link href="/reset-password" className={formStyles.authLink}><i className="bi bi-key me-2"></i>Forgot Password?</Link>
            </p>
        </AuthLayout>
    );
}