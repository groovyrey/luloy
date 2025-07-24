'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation'; // Import useRouter
import styles from './MessageCard.module.css';
import { useUser } from '../context/UserContext';
import { showToast } from '../utils/toast';
import Modal from './Modal'; // Import the Modal component

export default function MessageCard({ message, onDelete, onUpdateMessage }) {
  const { user, userData } = useUser();
  const router = useRouter(); // Initialize useRouter

  const [showOptions, setShowOptions] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showVisibilityConfirmModal, setShowVisibilityConfirmModal] = useState(false);
  const optionsRef = useRef(null);

  const optionsVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
  };

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

      if (response.ok) {
        
        if (onDelete) {
          onDelete(message.id);
        }
        showToast('Message deleted successfully', 'success');
        return true; // Indicate success
      } else {
        const errorData = await response.json();
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
          <h5 className={styles.senderName}><i className="bi bi-person-circle me-2"></i>{" "}{message.sender === "" ? <span className="text-danger">?</span> : <span>{message.sender}</span>}</h5>
          
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
        <p className={styles.messageContent}>{message.message}</p>
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
        <p>Are you sure you want to make this message {message.private ? 'public' : 'private'}?</p>
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