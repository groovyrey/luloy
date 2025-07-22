'use client';

import Link from 'next/link';

import FileIcon from './FileIcon';
import styles from './CodeSnippetCard.module.css';

export default function CodeSnippetCard({ snippet, className }) {
  return (
    <Link href={`/code-snippets/${snippet.id}`} className="text-decoration-none text-dark">
    <div
      className={`card mb-3 ${className}`}
    >
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <FileIcon filename={snippet.filename} className="me-3" style={{ fontSize: '2.5rem' }} />
            <div className="flex-grow-1 me-2" style={{ minWidth: 0 }}>
              <h5 className={`${styles.cardTitle} card-title mb-0 text-truncate`}>{snippet.filename}</h5>
              <small className="text-muted text-truncate">{snippet.language}</small>
            </div>
          </div>
          
        </div>
        {snippet.description && <p className="card-text mt-2">{snippet.description}</p>}
      </div>
    </div>
</Link>
  );
}