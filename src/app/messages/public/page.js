'use client';

import React, { useState, useEffect } from 'react';
import { db } from '../../../../lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, startAfter } from 'firebase/firestore';
import MessageCard from '@/app/components/MessageCard';
import LoadingMessage from '@/app/components/LoadingMessage';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { showToast } from '../../utils/toast';

export default function PublicMessagesPage() {
  useEffect(() => {
    document.title = "Public Messages";
  }, []);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageCursors, setPageCursors] = useState([null]); // pageCursors[0] is for page 1 (no cursor)
  const [hasNextPage, setHasNextPage] = useState(true);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "maindata"),
        where("private", "==", false),
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
  };

  useEffect(() => {
    fetchMessages();
    window.scrollTo(0, 0); // Scroll to top after fetching messages
  }, [page]);

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

  const handleDeleteMessage = (deletedMessageId) => {
    fetchMessages();
  };

  const handleUpdateMessage = async (updatedMessage) => {
    // A message's visibility might have changed, so we re-fetch to ensure
    // this list only contains public messages.
    setPage(1);
    setPageCursors([null]);
    setHasNextPage(true);
    await fetchMessages();
  };

  return (
    <div className="container">
      <h1 className="text-center my-4 text-primary"><i className="bi bi-globe me-2"></i>Public Messages</h1>
      <div className="text-center my-4">
        <Link href="/messages/public" className="btn btn-primary m-2"><i className="bi bi-globe me-2"></i>Public</Link>
        <Link href="/messages/private" className="btn btn-outline-primary m-2"><i className="bi bi-lock me-2"></i>Private</Link>
        <Link href="/messages/send" className="btn btn-outline-primary m-2"><i className="bi bi-send me-2"></i>Send a Message</Link>
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
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
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