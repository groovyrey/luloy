'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import FileIcon from './FileIcon';

export default function CodeSnippetCard({ snippet }) {
  return (
    <motion.div
      className="card mb-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <FileIcon filename={snippet.filename} className="me-3" style={{ fontSize: '2.5rem' }} />
            <div>
              <h5 className="card-title mb-0">{snippet.filename}</h5>
              <small className="text-muted">{snippet.language}</small>
            </div>
          </div>
          <Link href={`/code-snippets/${snippet.id}`} className="btn btn-sm btn-primary">
            View
          </Link>
        </div>
        {snippet.description && <p className="card-text mt-2">{snippet.description}</p>}
      </div>
    </motion.div>
  );
}