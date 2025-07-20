
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../../../lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, startAfter } from 'firebase/firestore';
import MessageCard from '@/app/components/MessageCard';
import LoadingMessage from '@/app/components/LoadingMessage';
import Link from 'next/link';
import { useUser } from '@/app/context/UserContext'; // Import useUser
import { motion, AnimatePresence } from 'framer-motion';
import { showToast } from '../../utils/toast';

export default function PrivateMessagesPage() {
  const { user, userData, loading: userLoading, refreshUserData } = useUser(); // Get user from context
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageCursors, setPageCursors] = useState([null]); // pageCursors[0] is for page 1 (no cursor)
  const [hasNextPage, setHasNextPage] = useState(true);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setMessages([]); // Clear messages to show skeleton during loading
    try {
      const q = query(
        collection(db, "maindata"),
        where("private", "==", true),
        orderBy("date", "desc"),
        orderBy("__name__", "desc"),
        ...(pageCursors[page - 1] ? [startAfter(pageCursors[page - 1])] : []),
        limit(6) // Fetch one more to check if there is a next page
      );

      const documentSnapshots = await getDocs(q);
      const newMessages = documentSnapshots.docs.slice(0, 5).map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date && typeof data.date.toDate === 'function' ? data.date.toDate().toISOString() : data.date,
        };
      });
      
      setMessages(newMessages);

      if (documentSnapshots.docs.length > 5) {
        setHasNextPage(true);
        const nextCursor = documentSnapshots.docs[4];
        if (pageCursors.length <= page) {
            setPageCursors(prev => [...prev, nextCursor]);
        }
      } else {
        setHasNextPage(false);
      }

    } catch (error) {
      showToast("Error fetching messages: " + error.message, 'error');
    }
    setLoading(false);
  }, [page]);

  const handleDeleteMessage = (deletedMessageId) => {
    fetchMessages();
  };

  const handleUpdateMessage = (updatedMessage) => {
    // A message's visibility might have changed, so we re-fetch to ensure
    // this list only contains private messages.
    fetchMessages();
  };

  useEffect(() => {
    document.title = "Private Messages";
  }, []);

  useEffect(() => {
    if (!userLoading && user && user.permissions?.canViewPrivateMessages) {
      fetchMessages();
    }
  }, [page, user, userLoading, userData, refreshUserData]);

  const handleNextPage = () => {
    if (hasNextPage) {
        setPage(prevPage => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(prevPage => prevPage - 1);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  if (userLoading || loading) {
    return <LoadingMessage />;
  }

  // If user is not authenticated or authLevel is not 1, display unauthorized message
  if (!user || !user.permissions?.canViewPrivateMessages) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        <div className="card m-2 text-center" style={{ maxWidth: '400px', width: '100%' }}>
          <div className="card-body">
            <div className="text-center mb-4">
              <img src="/luloy.svg" alt="Luloy Logo" style={{ height: '3em', marginBottom: '1em' }} />
              <h2 className="card-title text-danger"><i className="bi bi-exclamation-triangle me-2"></i>Unauthorized Access</h2>
            </div>
            <p className="text-lg text-muted mb-8">You are not authorized to view this page.</p>
            <Link href="/messages" className="btn btn-primary">
              <i className="bi bi-arrow-left me-2"></i>Go back to Messages
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card mb-3">
        <div className="card-body">
          <h1 className="card-title text-primary mb-2"><i className="bi bi-lock me-2"></i>Private Messages</h1>
          <div className="d-flex justify-content-center flex-wrap">
            <Link href="/messages/public" className="btn btn-outline-primary m-1"><i className="bi bi-globe me-2"></i>Public</Link>
            <Link href="/messages/private" className="btn btn-primary m-1"><i className="bi bi-lock me-2"></i>Private</Link>
            <Link href="/messages/send" className="btn btn-outline-primary m-1"><i className="bi bi-send me-2"></i>Send a Message</Link>
            
          </div>
        </div>
      </div>
      <AnimatePresence>
        {loading ? (
          <LoadingMessage />
        ) : (
          <motion.div
            className="row"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {messages.map(message => (
              <motion.div
                className="col-md-6 col-lg-4"
                key={message.id}
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
                <MessageCard message={message} onDelete={handleDeleteMessage} onUpdateMessage={handleUpdateMessage} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="d-flex justify-content-center my-4">
        <button className="btn btn-primary mx-2" onClick={handlePrevPage} disabled={page === 1}><i className="bi bi-arrow-left-circle me-2"></i>Previous</button>
        <button className="btn btn-primary mx-2" onClick={handleNextPage} disabled={!hasNextPage}><i className="bi bi-arrow-right-circle me-2"></i>Next</button>
      </div>
    </div>
  );
}
