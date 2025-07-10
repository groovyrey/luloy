'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './CodeStyles.module.css'; // Import the CSS module
import FileCardSkeleton from '../components/FileCardSkeleton';
import MotionWrapper from '../components/MotionWrapper';

function getFileIcon(filename) {
    if (!filename) return 'bi-file-earmark';
    const extension = filename.split('.').pop();
    switch (extension) {
        case 'js':
            return 'bi-filetype-js';
        case 'py':
            return 'bi-filetype-py';
        case 'html':
            return 'bi-filetype-html';
        case 'css':
            return 'bi-filetype-css';
        case 'json':
            return 'bi-filetype-json';
        case 'md':
            return 'bi-filetype-md';
        
        case 'svg':
            return 'bi-filetype-svg';
        case 'java':
            return 'bi-filetype-java';
        case 'ts':
            return 'bi-filetype-typescript';
        case 'tsx':
            return 'bi-filetype-tsx';
        case 'jsx':
            return 'bi-filetype-jsx';
        case 'xml':
            return 'bi-filetype-xml';
        case 'yml':
        case 'yaml':
            return 'bi-filetype-yml';
        case 'php':
            return 'bi-filetype-php';
        case 'rb':
            return 'bi-filetype-ruby';
        case 'go':
            return 'bi-filetype-go';
        case 'swift':
            return 'bi-filetype-swift';
        case 'kt':
            return 'bi-filetype-kotlin';
        case 'c':
            return 'bi-filetype-c';
        case 'h':
            return 'bi-filetype-h';
        case 'hpp':
            return 'bi-filetype-hpp';
        case 'cs':
            return 'bi-filetype-cs';
        case 'sh':
        case 'bat':
        case 'cmd':
            return 'bi-filetype-exe';
        case 'sql':
            return 'bi-filetype-sql';
        case 'txt':
        case 'log':
            return 'bi-file-earmark-text';
        case 'zip':
        case 'rar':
        case '7z':
            return 'bi-file-earmark-zip';
        case 'pdf':
            return 'bi-filetype-pdf';
        case 'doc':
        case 'docx':
            return 'bi-filetype-word';
        case 'xls':
        case 'xlsx':
            return 'bi-filetype-excel';
        case 'ppt':
        case 'pptx':
            return 'bi-filetype-ppt';
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'bmp':
        case 'webp':
            return 'bi-file-earmark-image';
        default:
            return 'bi-file-earmark';
    }
}

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
                <i className={`${styles.fileIcon} bi ${getFileIcon(file.filename)}`}></i>
                <span className={styles.fileName}>{file.filename}</span>
                <div className={styles.fileMeta}>
                  <span>{file.size ? (file.size / 1024).toFixed(2) : '0'} KB</span>
                  <span>{file.mtime ? new Date(file.mtime).toLocaleDateString() : 'Invalid Date'}</span>
                </div>
              </Link>
            )
          ))}
        </MotionWrapper>
      )}
    </div>
  );
}