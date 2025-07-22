'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useUser } from '../context/UserContext';
import LoadingMessage from '../components/LoadingMessage';

export default function LearnPageClient({ allOfficialPostsData, userPostsData: initialUserPostsData }) {
  const { user, userData, loading } = useUser();
  const [posts, setPosts] = useState(allOfficialPostsData);

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

  const handleDelete = async (slug) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const res = await fetch(`/api/posts/${slug}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete post');
      }

      toast.success('Post deleted successfully!');
      // Update the local state to remove the deleted post
      setPosts(posts.filter(post => post.slug !== slug));
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
    </div>
  );
}