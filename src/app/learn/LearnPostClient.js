'use client';

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Modal from '../components/Modal';
import { useUser } from '../context/UserContext';
import styles from './LearnPage.module.css';
import { capitalizeName } from '../utils/capitalizeName';

// Helper function to render author
const renderAuthor = (author, authorDetails) => {
  const isUid = /^[a-zA-Z0-9]{20,40}$/.test(author);

  if (isUid && authorDetails) {
    let displayName = '';
    if (authorDetails.firstName && authorDetails.lastName) {
      displayName = `${capitalizeName(authorDetails.firstName)} ${capitalizeName(authorDetails.lastName)}`;
    } else if (authorDetails.firstName) {
      displayName = capitalizeName(authorDetails.firstName);
    } else if (authorDetails.lastName) {
      displayName = capitalizeName(authorDetails.lastName);
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
  const { user, userData, loading } = useUser();
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isStaff = user && userData && userData.badges && userData.badges.includes('staff');

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    try {
      const res = await fetch(`/api/posts/${postData.slug}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete post');
      }

      toast.success('Post deleted successfully!');
      router.push('/learn'); // Redirect to learn page after deletion
    } catch (err) {
      console.error('Error deleting post:', err);
      toast.error(err.message || 'Failed to delete post.');
    }
  };

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
          {isStaff && (
            <div className="text-center mt-4">
              <button
                onClick={handleDelete}
                className="btn btn-danger"
              >
                Delete Post
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <h3>Confirm Deletion</h3>
        <p>Are you sure you want to delete this post? This action cannot be undone.</p>
        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
          <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}