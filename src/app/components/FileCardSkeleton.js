'use client';

import styles from './FileCardSkeleton.module.css';

export default function FileCardSkeleton() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonIcon}></div>
      <div className={styles.skeletonFileName}></div>
      <div className={styles.skeletonMeta}>
        <div className={styles.skeletonMetaItem}></div>
        <div className={styles.skeletonMetaItem}></div>
      </div>
    </div>
  );
}