'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './CodeStyles.module.css'; // Import the CSS module
import FileCardSkeleton from '../components/FileCardSkeleton';
import MotionWrapper from '../components/MotionWrapper';
import FileIcon from '../components/FileIcon';

export default function CodePage() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFiles() {
      try {
        const res = await fetch('/api/code');
        if (!res) {
          throw new Error('Failed to fetch file list');
        }
        const data = await res.json();
        setFiles(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchFiles();
  }, []);

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>Code Snippets</h1>
      <p className={styles.subtitle}>A Collection of code snippets, for fun and academic purposes.</p>
      {error && <p className="text-danger">{error}</p>}
      {loading ? (
        <div className={styles.fileGrid}>
          {Array.from({ length: 8 }).map((_, index) => (
            <FileCardSkeleton key={index} />
          ))}
        </div>
      ) : files.length === 0 ? (
        <p>No files found.</p>
      ) : (
        <MotionWrapper 
          className={styles.fileGrid}
        >
          {files.map(file => (
            file && file.filename && (
              <Link key={file.filename} href={`/code/view/${file.filename}`} className={styles.fileCard}>
                <FileIcon filename={file.filename} className={styles.fileIcon} />
                <span className={styles.fileName}>{file.filename}</span>
                <div className={styles.fileMeta}>
                  <span>{file.size ? (file.size / 1024).toFixed(2) : '0'} KB</span>
                </div>
              </Link>
            )
          ))}
        </MotionWrapper>
      )}
    </div>
  );
}