'use client';

import { motion } from "framer-motion";
import styles from './ResetPasswordLayout.module.css';
import Link from "next/link";

export default function ResetPasswordLayout({ title, subtitle, children }) {
    return (
        <div className={styles.container}>
            <motion.div
                className={styles.card}
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className={styles.header}>
                    <Link href="/">
                        <img src="/luloy.svg" alt="Luloy Logo" className={styles.logo} />
                    </Link>
                    <h2 className="fw-bold">{title}</h2>
                    <p className="text-muted">{subtitle}</p>
                </div>
                <div className={styles.formSection}>
                    {children}
                </div>
            </motion.div>
        </div>
    );
}
