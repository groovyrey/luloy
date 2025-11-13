'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { useTheme } from '../context/ThemeContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Modal from '../components/Modal';
import { useUser } from '../context/UserContext';
import LoadingMessage from '../components/LoadingMessage';
import styles from './[slug]/PostPage.module.css';
import { capitalizeName } from '../utils/capitalizeName';
import PostOptionsDropdown from '../components/PostOptionsDropdown';

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

export default function ArchivePostClient({ slug }) {
  const { user, userData, loading: userLoading } = useUser();
  const { theme, syntaxHighlighterTheme } = useTheme();
  const router = useRouter();
  const [postData, setPostData] = useState(null);
  const [postLoading, setPostLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${slug}`);
        if (!response.ok) {
          throw new Error('Failed to fetch post');
        }
        const data = await response.json();
        setPostData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setPostLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

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
      router.push('/archive'); // Redirect to archive page after deletion
    } catch (err) {
      console.error('Error deleting post:', err);
      toast.error(err.message || 'Failed to delete post.');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Post URL copied to clipboard!');
  };

  if (userLoading || postLoading) {
    return <LoadingMessage />;
  }

  if (!postData) {
    return <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>Post not found.</div>;
  }

  return (
    <div className={styles.postContainer}>
      <div className={styles.postHeaderCard}>
        <div className={styles.postHeader}>
          <h1 className={styles.postTitle}>{postData.title}</h1>
          <p className={styles.postMeta}>
            By {renderAuthor(postData.author, postData.authorDetails)} on {new Date(postData.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className={styles.dropdownWrapper}>
          <PostOptionsDropdown
            isStaff={isStaff}
            onShare={handleShare}
            onDelete={handleDelete}
            theme={theme}
          />
        </div>
      </div>
      <div className={styles.markdownBody}>
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={syntaxHighlighterTheme}
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
