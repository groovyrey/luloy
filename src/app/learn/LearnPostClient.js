'use client';

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
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
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h1>{postData.title}</h1>
      <p><em>By {renderAuthor(postData.author, postData.authorDetails)} on {new Date(postData.date).toLocaleDateString()}</em></p>
      <div className={styles.markdownBody}>
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={dracula}
                language={match[1]}
                PreTag="div"
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
  );
}