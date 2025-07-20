"use client";
import { useState, useEffect } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { motion } from 'framer-motion';
import styles from './SendMessage.module.css';
import { showToast } from '../../utils/toast';
import Link from 'next/link';

export default function SendMessage() {
  useEffect(() => {
    document.title = "Send Message";
  }, []);
  const [message, setMessage] = useState('');
  const [sender, setSender] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await addDoc(collection(db, 'maindata'), {
        sender: sender,
        message: message,
        private: isPrivate,
        date: new Date(),
      });
      setMessage('');
      setSender('');
      setIsPrivate(false);
      showToast('Message sent successfully!', 'success');
    } catch (error) {
      showToast('Error sending message: ' + error.message, 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <motion.div
      className="d-flex flex-column align-items-center justify-content-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ minHeight: '80vh' }}
    >
      <div className="card" style={{ maxWidth: '600px', width: '100%' }}>
        <div className="card-header">
          <img src="/luloy.svg" alt="Luloy Logo" className="mb-3" style={{ height: '4.5em' }} />
          <h2 className="card-title fw-bold mb-0 fs-3"><i className="bi bi-send me-2"></i>Send a Message</h2>
          <p className="mb-0 opacity-75">Send a public or private message.</p>
          <div className="text-center mt-3">
            
          </div>
        </div>
        <div className="card-body">
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="sender" className="form-label"><i className="bi bi-person me-2"></i>Sender Email or Name (Optional)</label>
              <input
                type="text"
                id="sender"
                className="form-control"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="Your email or name (e.g., Anonymous)"
                maxLength={50}
              />
              <small className="form-text text-muted">{sender.length}/50</small>
            </div>
            <div className="mb-3">
              
              <textarea
                id="message"
                className="form-control"
                rows="5"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message here..."
                maxLength={100}
                required
              ></textarea>
              <small className="form-text text-muted">{message.length}/100</small>
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
  );
}