'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import FileIcon from './FileIcon';

export default function CodeSnippetCard({ snippet, className }) {
  return (
    <Link href={`/code-snippets/${snippet.id}`} className="text-decoration-none text-dark">
    <motion.div
      className={`card mb-3 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <FileIcon filename={snippet.filename} className="me-3" style={{ fontSize: '2.5rem' }} />
            <div className="flex-grow-1 me-2">
              <h5 className="card-title mb-0 text-truncate">{snippet.filename}</h5>
              <small className="text-muted text-truncate">{snippet.language}</small>
            </div>
          </div>
          
        </div>
        {snippet.description && <p className="card-text mt-2">{snippet.description}</p>}
      </div>
    </motion.div>
</Link>
  );
}