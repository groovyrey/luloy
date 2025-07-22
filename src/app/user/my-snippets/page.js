'use client';

import { useEffect, useState } from 'react';
import { useUser } from '../../../app/context/UserContext';
import LoadingMessage from '../../../app/components/LoadingMessage';
import { showToast } from '../../../app/utils/toast';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function MySnippetsPage() {
  const { user, loading: userLoading } = useUser();
  const [userSnippets, setUserSnippets] = useState(null);
  const [loadingSnippets, setLoadingSnippets] = useState(true);

  useEffect(() => {
    document.title = "My Code Snippets";
  }, []);

  useEffect(() => {
    if (!userLoading && user) {
      const fetchSnippets = async () => {
        try {
          const res = await fetch(`/api/user-snippets/${user.uid}`);
          if (res.ok) {
            const data = await res.json();
            setUserSnippets(data);
          } else {
            const errorData = await res.json();
            showToast(errorData.error || 'Failed to fetch your snippets.', 'error');
          }
        } catch (err) {
          showToast('An unexpected error occurred while fetching your snippets.', 'error');
        } finally {
          setLoadingSnippets(false);
        }
      };
      fetchSnippets();
    } else if (!userLoading && !user) {
      // Redirect or show unauthorized message if not logged in
      setLoadingSnippets(false);
      showToast('You must be logged in to view this page.', 'error');
      // Optionally, redirect to login page
      // router.push('/login');
    }
  }, [user, userLoading]);

  const handleDeleteSnippet = async (snippetId) => {
    if (!confirm('Are you sure you want to delete this snippet? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/code-snippets/${snippetId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        showToast('Snippet deleted successfully!', 'success');
        // Remove the deleted snippet from the state
        setUserSnippets(prevSnippets => prevSnippets.filter(snippet => snippet.snippetId !== snippetId));
      } else {
        const errorData = await res.json();
        showToast(errorData.error || 'Failed to delete snippet.', 'error');
      }
    } catch (err) {
      showToast('An unexpected error occurred during deletion.', 'error');
    }
  };

  if (userLoading || loadingSnippets) {
    return <LoadingMessage />;
  }

  if (!user) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        <div className="card m-2 text-center" style={{ maxWidth: '400px', width: '100%' }}>
          <div className="card-body">
            <div className="text-center mb-4">
              <img src="/luloy.svg" alt="Luloy Logo" style={{ height: '3em', marginBottom: '1em' }} />
              <h2 className="card-title text-danger"><i className="bi bi-exclamation-triangle me-2"></i>Unauthorized Access</h2>
            </div>
            <p className="text-lg text-muted mb-8">You must be logged in to view your snippets.</p>
            <Link href="/login" className="btn btn-primary">
              <i className="bi-box-arrow-in-right me-2"></i> Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <motion.div
        className="card"
        style={{ maxWidth: '800px', width: '100%' }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="card-title mb-0">My Code Snippets</h1>
            <Link href="/upload/code-snippet-upload" className="btn btn-primary btn-sm">
              <i className="bi bi-plus-lg me-2"></i>Upload New Snippet
            </Link>
          </div>
          {userSnippets && userSnippets.length > 0 ? (
            <ul className="list-group list-group-flush">
              {userSnippets.map(snippet => (
                <li key={snippet.snippetId} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{snippet.filename}</strong> ({snippet.language})
                    {snippet.description && <p className="text-muted mb-0">{snippet.description}</p>}
                    <small className="text-muted">Uploaded: {new Date(snippet.createdAt).toLocaleDateString()}</small>
                  </div>
                  <div>
                    <Link href={`/code-snippets/${snippet.snippetId}`} className="btn btn-sm btn-primary me-2">
                      View
                    </Link>
                    <button
                      onClick={() => handleDeleteSnippet(snippet.snippetId)}
                      className="btn btn-sm btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-muted fst-italic">
              <p className="mb-0">You have not uploaded any code snippets yet.</p>
              <Link href="/upload/code-snippet-upload" className="btn btn-primary mt-3">
                Upload Your First Snippet
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
