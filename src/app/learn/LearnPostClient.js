'use client';

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Link from 'next/link';
import styles from './LearnPage.module.css';

// Helper function to render author
const renderAuthor = (author, authorDetails) => {
  const isUid = /^[a-zA-Z0-9]{20,40}$/.test(author);

  if (isUid && authorDetails) {
    let displayName = '';
    if (authorDetails.firstName && authorDetails.lastName) {
      displayName = `${authorDetails.firstName} ${authorDetails.lastName}`;
    } else if (authorDetails.firstName) {
      displayName = authorDetails.firstName;
    } else if (authorDetails.lastName) {
      displayName = authorDetails.lastName;
    } else {
      displayName = author; // Fallback to UID if no name parts are found
    }

    return (
      <Link href={`/user/${author}`} style={{ textDecoration: 'underline', color: 'var(--primary-color)' }}>
        {displayName}
      </Link>
    );
  } else if (isUid) {
    // If it's a UID but details couldn't be fetched, just show the UID as a link
    return (
      <Link href={`/user/${author}`} style={{ textDecoration: 'underline', color: 'var(--primary-color)' }}>
        {author}
      </Link>
    );
  } else {
    return author;
  }
};

export default function LearnPostClient({ postData }) {
  return (
    <div className="container py-5">
      <div className="card">
        <div className="card-body">
          <h1 className="card-title text-center mb-4">{postData.title}</h1>
          <p className="text-center text-muted mb-4"><em>By {renderAuthor(postData.author, postData.authorDetails)} on {new Date(postData.date).toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' })}</em></p>
          <div className={styles.markdownBody}>
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {postData.content}
      </ReactMarkdown>
      </div>
        </div>
      </div>
    </div>
  );
}