'use client';

import React, { useState, useEffect } from 'react';
import { showToast } from '../../utils/toast';
import LoadingMessage from '../../components/LoadingMessage';
import UserSearchResultCard from '../../components/UserSearchResultCard';
import { motion } from 'framer-motion';

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
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <motion.div
        className="card m-2 shadow-lg rounded-3"
        style={{ maxWidth: '600px', width: '100%' }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="card-body p-4">
          <h2 className="card-title text-center mb-4 display-6 fw-bold text-primary"><span className="bi-search me-2"></span>Search Users</h2>
          
          <form onSubmit={handleSearch} className="mb-4">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search by full name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={loading}
              />
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  <i className="bi-search"></i>
                )}
                <span className="ms-2">Search</span>
              </button>
            </div>
          </form>

          {loading && <LoadingMessage message="Searching..." />}

          {!loading && hasSearched && searchResults.length === 0 && (
            <div className="alert alert-info text-center" role="alert">
              No users found matching your query.
            </div>
          )}

          {!loading && searchResults.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-3">Search Results:</h3>
              <div className="list-group">
                {searchResults.map((user) => (
                  <UserSearchResultCard key={user.id} user={user} />
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
