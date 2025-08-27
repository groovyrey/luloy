'use client';

import { motion } from "framer-motion";
import styles from './AuthLayout.module.css';
import Link from "next/link";

export default function AuthLayout({ title, subtitle, brandingTitle, brandingSubtitle, children }) {
    return (
        <div className={styles.authContainer}>
            <motion.div
                className={styles.authCard}
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className={styles.brandingSection}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Link href="/">
                            <img src="/luloy.svg" alt="Luloy Logo" style={{ height: '5em', marginBottom: '1em', cursor: 'pointer' }} />
                        </Link>
                        <h1 className="fw-bold">{brandingTitle}</h1>
                        <p>{brandingSubtitle}</p>
                    </motion.div>
                </div>
                <div className={styles.formSection}>
                    <h2>{title}</h2>
                    <p>{subtitle}</p>
                    {children}
                </div>
            </motion.div>
        </div>
    );
}
