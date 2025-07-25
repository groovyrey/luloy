'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation'; // Import useRouter
import styles from './GuestbookEntryCard.module.css';
import { useUser } from '../context/UserContext';
import { showToast } from '../utils/toast';
import Modal from './Modal'; // Import the Modal component
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import c from 'react-syntax-highlighter/dist/esm/languages/prism/c';
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';
import php from 'react-syntax-highlighter/dist/esm/languages/prism/php';
import ruby from 'react-syntax-highlighter/dist/esm/languages/prism/ruby';
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go';

SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('c', c);
SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('php', php);
SyntaxHighlighter.registerLanguage('ruby', ruby);
SyntaxHighlighter.registerLanguage('go', go);

export default function MessageCard({ message, onDelete, onUpdateMessage }) {
  const { user, userData, allUsersData, fetchAndStoreUserData } = useUser();
  const router = useRouter(); // Initialize useRouter

  const [showOptions, setShowOptions] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showVisibilityConfirmModal, setShowVisibilityConfirmModal] = useState(false);
  const [senderUserData, setSenderUserData] = useState(null);
  const optionsRef = useRef(null);

  const optionsVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
  };

  useEffect(() => {
    if (message.sender && message.sender.length === 28) { // Basic check for UID format
      if (allUsersData[message.sender]) {
        setSenderUserData(allUsersData[message.sender]);
      } else {
        fetchAndStoreUserData(message.sender);
      }
    } else {
      setSenderUserData(null);
    }
  }, [message.sender, allUsersData, fetchAndStoreUserData]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [optionsRef]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const handleDelete = async () => {
    if (!user || !user.idToken) {
      showToast('User not authenticated or ID token not available.', 'error');
      return;
    }

    try {
      const response = await fetch('/api/messages/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.idToken}`,
        },
        body: JSON.stringify({ messageId: message.id }),
      });

      console.log('Delete API Response:', response);
      if (response.ok) {
        console.log('Message deleted successfully on server.');
        if (onDelete) {
          onDelete(message.id);
        }
        showToast('Message deleted successfully', 'success');
        return true; // Indicate success
      } else {
        console.error('Failed to delete message. Response status:', response.status);
        const errorData = await response.json();
        console.error('Error data:', errorData);
        showToast(`Failed to delete message: ${errorData.message}`, 'error');
        return false; // Indicate failure
      }
    } catch (error) {
      showToast('Error deleting message:', 'error');
    }
  };

  const handleChangeVisibility = async () => {
    if (!user || !user.idToken) {
      showToast('User not authenticated or ID token not available.', 'error');
      return;
    }

    try {
      const newVisibility = !message.private;
      const response = await fetch('/api/messages/update-visibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.idToken}`,
        },
        body: JSON.stringify({ messageId: message.id, private: newVisibility }),
      });

      if (response.ok) {
        showToast('Message visibility changed successfully', 'success');
        if (onUpdateMessage) {
          onUpdateMessage({ ...message, private: newVisibility });
        }
      } else {
        const errorData = await response.json();
        showToast(`Failed to update message visibility: ${errorData.message}`, 'error');
      }
    } catch (error) {
      showToast(`Error updating message visibility: ${error.message}`, 'error');
    }
  };

  const confirmDelete = () => {
    setShowOptions(false);
    setShowDeleteConfirmModal(true);
  };

  const confirmChangeVisibility = () => {
    setShowOptions(false);
    setShowVisibilityConfirmModal(true);
  };

  const performDelete = async () => {
    setShowDeleteConfirmModal(false);
    await handleDelete();
  };

  const performChangeVisibility = async () => {
    setShowVisibilityConfirmModal(false);
    await handleChangeVisibility();
  };

  return (
    <motion.div
      className={`${styles.messageCardContainer} card mb-4`}
      
      onClick={() => { if (user && user.permissions?.canManageMessages) setShowOptions(!showOptions); }}
    >
      <div className="card-body">
        <div className={styles.cardHeader}>
          {senderUserData ? (
            <div className="d-flex align-items-center">
              <img
                src={senderUserData.profilePictureUrl || '/luloy.svg'}
                alt={senderUserData.username || senderUserData.firstName || 'User'}
                className="rounded-circle me-2" style={{ width: '30px', height: '30px', objectFit: 'cover' }}
              />
              <h5 className={styles.senderName}>
                {senderUserData.username || senderUserData.firstName || 'Anonymous'}
              </h5>
            </div>
          ) : (
            <h5 className={styles.senderName}><i className="bi bi-person-circle me-2"></i>{" "}{message.sender === "" ? <span className="text-danger">?</span> : <span>{message.sender}</span>}</h5>
          )}
          
        </div>
        <AnimatePresence>
          {showOptions && (
            <motion.div
              ref={optionsRef}
              className={styles.optionsMenu}
              variants={optionsVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()} // Prevent clicks inside options from closing the card
            >
              <button className="btn btn-link text-start" onClick={() => {
                router.push(`/messages/edit/${message.id}`);
                setShowOptions(false);
              }}>
                <i className="bi bi-pencil-square me-2"></i>Edit
              </button>
              <button className="btn btn-link text-start" onClick={confirmChangeVisibility}>
                <i className={`bi ${message.private ? 'bi-eye-slash-fill' : 'bi-eye-fill'} me-2`}></i>
                {message.private ? 'Make Public' : 'Make Private'}
              </button>
              <button className="btn btn-link text-danger text-start" onClick={confirmDelete}>
                <i className="bi bi-trash-fill me-2"></i>Delete
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{
                    borderRadius: 'var(--border-radius-base)',
                  }}
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
          {message.message}
        </ReactMarkdown>
        <div className="d-flex justify-content-between align-items-center">
          <small className="">
            {message.date ? formatTimeAgo(message.date) : 'Date N/A'}
          </small>
          
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteConfirmModal} onClose={() => setShowDeleteConfirmModal(false)}>
        <h2>Confirm Deletion</h2>
        <p>Are you sure you want to delete this message? This action cannot be undone.</p>
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button className="btn btn-secondary" onClick={() => setShowDeleteConfirmModal(false)}><i className="bi bi-x-circle me-2"></i>Cancel</button>
          <button className="btn btn-danger" onClick={performDelete}><i className="bi bi-trash me-2"></i>Delete</button>
        </div>
      </Modal>

      {/* Change Visibility Confirmation Modal */}
      <Modal isOpen={showVisibilityConfirmModal} onClose={() => setShowVisibilityConfirmModal(false)}>
        <h2>Confirm Visibility Change</h2>
        <p>Are you sure you want to make this guestbook entry {message.private ? 'public' : 'private'}?</p>
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button className="btn btn-secondary" onClick={() => setShowVisibilityConfirmModal(false)}><i className="bi bi-x-circle me-2"></i>Cancel</button>
          <button className="btn btn-primary" onClick={performChangeVisibility}><i className="bi bi-check-circle me-2"></i>Confirm</button>
        </div>
      </Modal>
    </motion.div>
  );
}

function isValidDate(dateString) {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

function formatTimeAgo(dateString) {
  if (!isValidDate(dateString)) {
    return "Invalid Date";
  }

  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  let interval = seconds / 31536000; // seconds in a year
  if (interval >= 1) {
    return Math.floor(interval) + (Math.floor(interval) === 1 ? " year ago" : " years ago");
  }
  interval = seconds / 2592000; // seconds in a month
  if (interval >= 1) {
    return Math.floor(interval) + (Math.floor(interval) === 1 ? " month ago" : " months ago");
  }
  interval = seconds / 86400; // seconds in a day
  if (interval >= 1) {
    return Math.floor(interval) + (Math.floor(interval) === 1 ? " day ago" : " days ago");
  }
  interval = seconds / 3600; // seconds in an hour
  if (interval >= 1) {
    return Math.floor(interval) + (Math.floor(interval) === 1 ? " hour ago" : " hours ago");
  }
  interval = seconds / 60; // seconds in a minute
  if (interval >= 1) {
    return Math.floor(interval) + (Math.floor(interval) === 1 ? " minute ago" : " minutes ago");
  }
  return Math.floor(seconds) + (Math.floor(seconds) === 1 ? " second ago" : " seconds ago");
}