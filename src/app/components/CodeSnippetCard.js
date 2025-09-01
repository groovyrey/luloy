'use client';

import Link from 'next/link';
import { Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import FileIcon from './FileIcon';
import styles from './CodeSnippetCard.module.css';

export default function CodeSnippetCard({ snippet, className }) {
  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      {snippet.filename}
    </Tooltip>
  );

  return (
    <Link href={`/code-snippets/${snippet.id}`} className="text-decoration-none">
      <div className={`${styles.card} ${className}`}>
        <div className={styles.cardHeader}>
          <FileIcon filename={snippet.language} />
          <OverlayTrigger
            placement="top"
            delay={{ show: 250, hide: 400 }}
            overlay={renderTooltip}
          >
            <h5 className={styles.cardTitle}>{snippet.filename}</h5>
          </OverlayTrigger>
          <Badge pill bg="secondary" className={styles.languageBadge}>
            {snippet.language}
          </Badge>
        </div>
      </div>
    </Link>
  );
}