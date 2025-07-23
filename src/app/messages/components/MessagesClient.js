'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '../../../../lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, startAfter, addDoc } from 'firebase/firestore';
import MessageCard from '@/app/components/MessageCard';
import LoadingMessage from '@/app/components/LoadingMessage';
import { useUser } from '@/app/context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import { showToast } from '../../utils/toast';
import styles from '../SendMessage.module.css';

export default function MessagesClient() {
  const { user, userData, loading: userLoading } = useUser();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('public'); // State for active tab

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['public', 'private', 'send'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageCursors, setPageCursors] = useState([null]);
  const [hasNextPage, setHasNextPage] = useState(true);

  // State for Send Message form
  const [messageContent, setMessageContent] = useState('');
  const [sender, setSender] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    document.title = `Messages - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`;
  }, [activeTab]);

  const fetchMessages = useCallback(async (isPrivateFetch) => {
    setLoading(true);
    setMessages([]);
    try {
      let q;
      if (isPrivateFetch) {
        if (!user || !user.permissions?.canViewPrivateMessages) {
          setMessages([]); // Clear messages if unauthorized
          setLoading(false);
          return;
        }
        q = query(
          collection(db, "maindata"),
          where("private", "==", true),
          orderBy("date", "desc"),
          orderBy("__name__", "desc"),
          ...(pageCursors[page - 1] ? [startAfter(pageCursors[page - 1])] : []),
          limit(6)
        );
      } else {
        q = query(
          collection(db, "maindata"),
          where("private", "==", false),
          orderBy("date", "desc"),
          orderBy("__name__", "desc"),
          ...(pageCursors[page - 1] ? [startAfter(pageCursors[page - 1])] : []),
          limit(6)
        );
      }

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
  }, [page, user, pageCursors]);

  useEffect(() => {
    if (activeTab === 'public') {
      fetchMessages(false);
    } else if (activeTab === 'private') {
      fetchMessages(true);
    }
    window.scrollTo(0, 0);
  }, [page, activeTab, fetchMessages]);

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

  const handleDeleteMessage = (deletedMessageId) => {
    if (activeTab === 'public') {
      fetchMessages(false);
    } else if (activeTab === 'private') {
      fetchMessages(true);
    }
  };

  const handleUpdateMessage = async (updatedMessage) => {
    setPage(1);
    setPageCursors([null]);
    setHasNextPage(true);
    if (activeTab === 'public') {
      await fetchMessages(false);
    } else if (activeTab === 'private') {
      await fetchMessages(true);
    }
  };

  const handleSendMessageSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await addDoc(collection(db, 'maindata'), {
        sender: sender,
        message: messageContent,
        private: isPrivate,
        date: new Date(),
      });
      setMessageContent('');
      setSender('');
      setIsPrivate(false);
      showToast('Message sent successfully!', 'success');
    } catch (error) {
      showToast('Error sending message: ' + error.message, 'error');
    } finally {
      setIsSending(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  if (userLoading) {
    return <LoadingMessage />;
  }

  return (
    <div className="container">
      <div className="card mb-3">
        <div className="card-body">
          <h1 className="card-title text-primary mb-2 text-center"><i className="bi bi-chat-dots me-2"></i>Messages</h1>
          <div className="d-flex justify-content-center flex-wrap">
            <button
              className={`btn ${activeTab === 'public' ? 'btn-primary' : 'btn-outline-primary'} m-1`}
              onClick={() => setActiveTab('public')}
            >
              <i className="bi bi-globe me-2"></i>Public
            </button>
            <button
              className={`btn ${activeTab === 'private' ? 'btn-primary' : 'btn-outline-primary'} m-1`}
              onClick={() => setActiveTab('private')}
            >
              <i className="bi bi-lock me-2"></i>Private
            </button>
            <button
              className={`btn ${activeTab === 'send' ? 'btn-primary' : 'btn-outline-primary'} m-1`}
              onClick={() => setActiveTab('send')}
            >
              <i className="bi bi-send me-2"></i>Send a Message
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'public' && (
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
      )}

      {activeTab === 'private' && (
        <>
          {user && user.permissions?.canViewPrivateMessages ? (
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
          ) : (
            <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
              <div className="card m-2 text-center" style={{ maxWidth: '400px', width: '100%' }}>
                <div className="card-body">
                  <div className="text-center mb-4">
                    <img src="/luloy.svg" alt="Luloy Logo" style={{ height: '3em', marginBottom: '1em' }} />
                    <h2 className="card-title text-danger"><i className="bi bi-exclamation-triangle me-2"></i>Unauthorized Access</h2>
                  </div>
                  <p className="text-lg text-muted mb-8">You are not authorized to view private messages.</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'send' && (
        <motion.div
          className="d-flex flex-column align-items-center justify-content-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ minHeight: '60vh' }}
        >
          <div className="card" style={{ maxWidth: '600px', width: '100%' }}>
            <div className="card-header">
              <img src="/luloy.svg" alt="Luloy Logo" className="mb-3" style={{ height: '4.5em' }} />
              <h2 className="card-title fw-bold mb-0 fs-3"><i className="bi bi-send me-2"></i>Send a Message</h2>
              <p className="mb-0 opacity-75">Send a public or private message.</p>
            </div>
            <div className="card-body">
              <form onSubmit={handleSendMessageSubmit}>
                <div className="mb-3">
                  <label htmlFor="sender" className="form-label"><i className="bi bi-person me-2"></i>Sender (Optional)</label>
                  <input
                    type="text"
                    id="sender"
                    className="form-control"
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    placeholder="Sender"
                    maxLength={50}
                  />
                  <small className="form-text text-muted">{sender.length}/50</small>
                </div>
                <div className="mb-3">
                  <textarea
                    id="messageContent"
                    className="form-control"
                    rows="5"
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Write your message here..."
                    maxLength={100}
                    required
                  ></textarea>
                  <small className="form-text text-muted">{messageContent.length}/100</small>
                </div>
                <div className={`${styles.sendMessagePrivateToggleCard} mb-3`} onClick={() => setIsPrivate(!isPrivate)}>
                  <div className={styles.sendMessagePrivateToggleContent}>
                    <i className={`bi ${isPrivate ? 'bi-eye-slash' : 'bi-eye'} me-2`}></i>
                    <span className={styles.sendMessagePrivateToggleLabel}>
                      {isPrivate ? 'Private' : 'Public'} Message
                    </span>
                  </div>
                  <div className={styles.sendMessagePrivateToggleSwitch} data-private={isPrivate}>
                    <motion.div
                      className={styles.sendMessagePrivateToggleHandle}
                      layout
                      transition={{ type: 'spring', stiffness: 700, damping: 30 }}
                    />
                  </div>
                </div>
                <div className="d-grid gap-2">
                  <motion.button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSending}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isSending ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                      <i className="bi-send me-2"></i>
                    )}{' '}
                    {isSending ? 'Sending...' : 'Send Message'}
                  </motion.button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      )}

      {(activeTab === 'public' || activeTab === 'private') && (
        <div className="d-flex justify-content-center my-4">
          <button className="btn btn-primary mx-2" onClick={handlePrevPage} disabled={page === 1}><i className="bi bi-arrow-left-circle me-2"></i>Previous</button>
          <button className="btn btn-primary mx-2" onClick={handleNextPage} disabled={!hasNextPage}><i className="bi bi-arrow-right-circle me-2"></i>Next</button>
        </div>
      )}
    </div>
  );
}
