'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from '../context/UserContext';
import LoadingMessage from '../components/LoadingMessage';
import { motion } from "framer-motion";
import Link from 'next/link';
import AuthLayout from '../components/AuthLayout';
import formStyles from '../components/AuthForm.module.css';
import { showToast } from '../utils/toast';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "/lib/firebase.js";

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

    const handleSignup = async (e) => {
        e.preventDefault();
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

    if (loading || user) {
        return <LoadingMessage />;
    }

    return (
        <AuthLayout
            title="Sign Up"
            subtitle="Create your account to get started."
            brandingTitle="Join Our Community"
            brandingSubtitle="Create an account to unlock all the features of Luloy."
        >
            <form onSubmit={handleSignup}>
                <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                    <div className="form-floating mb-3">
                        <input type="text" className="form-control" id="firstNameInput" placeholder=" " onChange={e => setFirstName(e.target.value)} />
                        <label htmlFor="firstNameInput"><i className="bi bi-person me-2"></i>First Name</label>
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                    <div className="form-floating mb-3">
                        <input type="text" className="form-control" id="lastNameInput" placeholder=" " onChange={e => setLastName(e.target.value)} />
                        <label htmlFor="lastNameInput"><i className="bi bi-person me-2"></i>Last Name</label>
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
                    <div className="form-floating mb-3">
                        <input type="number" className="form-control" id="ageInput" placeholder=" " onChange={e => setAge(e.target.value)} />
                        <label htmlFor="ageInput"><i className="bi bi-calendar me-2"></i>Age</label>
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
                    <div className="form-floating mb-3">
                        <input type="email" className="form-control" id="emailInput" placeholder=" " onChange={e => setEmail(e.target.value)} />
                        <label htmlFor="emailInput"><i className="bi bi-envelope me-2"></i>Email</label>
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
                    <div className="form-floating mb-3">
                        <input type="password" className="form-control" id="passwordInput" placeholder=" " onChange={e => setPassword(e.target.value)} />
                        <label htmlFor="passwordInput"><i className="bi bi-lock me-2"></i>Password</label>
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }}>
                    <div className="d-grid gap-2">
                        <button className={`btn btn-primary ${formStyles.authButton}`} type="submit" disabled={isSigningUp}>
                            {isSigningUp ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            ) : (
                                <i className="bi-person-plus me-2"></i>
                            )}{' '}{isSigningUp ? 'Signing up...' : 'Sign Up'}
                        </button>
                    </div>
                </motion.div>
            </form>
            <p className="mt-3 text-center">
                Already have an account? <Link href="/login" className={formStyles.authLink}><i className="bi bi-box-arrow-in-right me-2"></i>Login</Link>
            </p>
        </AuthLayout>
    );
}