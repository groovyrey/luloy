'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import Modal from '../components/Modal';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useUser } from '../context/UserContext';
import LoadingMessage from '../components/LoadingMessage';

export default function LearnPageClient({ allOfficialPostsData, userPostsData: initialUserPostsData }) {
  const { user, userData, loading } = useUser();
  const [posts, setPosts] = useState(allOfficialPostsData);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDeleteSlug, setPostToDeleteSlug] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Adjust as needed for desired stagger effect
        delayChildren: 0.2, // Delay before children start animating
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10,
      },
    },
  };

  if (loading) {
    return <LoadingMessage />;
  }

  const isStaff = user && userData && userData.badges && userData.badges.includes('staff');

  const handleDelete = (slug) => {
    setPostToDeleteSlug(slug);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    if (!postToDeleteSlug) return;

    try {
      const res = await fetch(`/api/posts/${postToDeleteSlug}`, {
        method: 'DELETE',
        credentials: 'include', // Ensure cookies are sent
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete post');
      }

      toast.success('Post deleted successfully!');
      // Update the local state to remove the deleted post
      setPosts(posts.filter(post => post.slug !== postToDeleteSlug));
      setPostToDeleteSlug(null); // Clear the slug after deletion
    } catch (err) {
      console.error('Error deleting post:', err);
      toast.error(err.message || 'Failed to delete post.');
    }
  };

  return (
    <div>
      {isStaff && (
        <div className="text-center mb-4">
          <Link href="/upload/blob-upload" className="btn btn-primary">
            Upload Learning Resources
          </Link>
        </div>
      )}
      
      {posts.length === 0 ? (
        <div className="text-center text-muted fst-italic mt-4">
          <p className="mb-0">No official learning resources found yet.</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="row g-4"
        >
          {posts.map(({ slug, title, date, description }) => (
            <div key={slug} className="col-md-6 mb-4">
              <motion.div variants={itemVariants}>
              <div className="card mb-3">
                <div className="card-body">
                  <Link href={`/learn/${slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h5 className="card-title mb-2 text-primary">{title}</h5>
                    <p className="mb-1">{description}</p>
                    <small className="text-muted">{new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</small>
                  </Link>
                  {isStaff && (
                    <button
                      onClick={() => handleDelete(slug)}
                      className="btn btn-sm btn-danger mt-2"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
            </div>
          ))}
        </motion.div>
      )}

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
