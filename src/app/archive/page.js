import ArchivePageClient from './ArchivePageClient';
import styles from './ArchivePage.module.css';

export const dynamic = 'force-dynamic'; // Ensure the page is dynamic

export default function ArchivePage() {
  return (
    <div className={styles.archiveContainer}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Luloy Archive</h1>
        <p className={styles.heroSubtitle}>Explore a collection of posts on various topics.</p>
      </div>
      <ArchivePageClient />
    </div>
  );
}