'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './CodeStyles.module.css'; // Import the CSS module

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
      <h1 className={styles.title}>Code Files</h1>
      <p className={styles.subtitle}>Browse and view your code snippets.</p>
      {error && <p className="text-danger">{error}</p>}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : files.length === 0 ? (
        <p>No files found.</p>
      ) : (
        <div className={styles.fileGrid}>
          {files.map(file => (
            <Link key={file} href={`/code/view/${file}`} className={styles.fileCard}>
              <i className={`${styles.fileIcon} bi ${getFileIcon(file)}`}></i>
              <span className={styles.fileName}>{file}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}