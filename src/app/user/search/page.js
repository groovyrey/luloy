'use client';

import React, { useState, useEffect } from 'react';
import { showToast } from '../../utils/toast';
import LoadingMessage from '../../components/LoadingMessage';
import UserSearchResultCard from '../../components/UserSearchResultCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    document.title = "Search Users";
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setHasSearched(true);

    if (!searchQuery.trim()) {
      showToast('Please enter a search query.', 'error');
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/user/search?query=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      } else {
        const errorData = await res.json();
        showToast(errorData.error || 'Failed to search users.', 'error');
        setSearchResults([]);
      }
    } catch (err) {
      showToast('An unexpected error occurred during search.', 'error');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 animated fadeIn">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-7">
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="card-header">
              <img src="/luloy.svg" alt="Luloy Logo" className="mb-3" style={{ height: '4.5em' }} />
              <h2 className="card-title fw-bold mb-0 fs-3">Search Users</h2>
              <p className="mb-0 opacity-75">Find user accounts by name.</p>
            </div>
            <div className="card-body p-4 p-md-5">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="input-group input-group-lg shadow-sm rounded-pill overflow-hidden border border-primary">
                  <input
                    type="text"
                    className="form-control border-0 ps-4"
                    placeholder="Search by full name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={loading}
                  />
                  <button className="btn btn-primary px-4" type="submit" disabled={loading}>
                    {loading ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                      <i className="bi bi-search"></i>
                    )}
                    <span className="ms-2 d-none d-sm-inline">Search</span>
                  </button>
                </div>
              </form>

              {loading && <LoadingMessage message="Searching..."/>}

              {!loading && hasSearched && searchResults.length === 0 && (
                <div className="alert alert-info text-center animated fadeIn" role="alert">
                  No users found matching your query.
                </div>
              )}

              {!loading && searchResults.length > 0 && (
                <motion.div
                  className="mt-4 animated fadeIn"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1,
                        delayChildren: 0.2,
                      },
                    },
                  }}
                  initial="hidden"
                  animate="visible"
                >
                  <h3 className="mb-3 text-primary">Search Results:</h3>
                  <div className="list-group shadow-sm">
                    {searchResults.map((user) => (
                      <motion.div
                        key={user.id}
                        variants={{
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
                        }}
                      >
                        <UserSearchResultCard user={user} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}