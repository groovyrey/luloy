'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { useChat } from '../hooks/useChat';
import styles from './Chat.module.css';
import MessageSkeleton from '../components/MessageSkeleton';

export default function ChatClient() {
  const { user } = useUser();
  const { messages, loading, sendMessage, hasMore, loadMoreMessages } = useChat();
  const [messageText, setMessageText] = useState('');
  const messagesContainerRef = useRef(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Scroll to bottom on new messages, but only if user is already at the bottom
  useEffect(() => {
    if (messagesContainerRef.current && isScrolledToBottom) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
    if (!loading && !initialLoadDone) {
      // After initial load, scroll to bottom and mark initial load as done
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      setInitialLoadDone(true);
    }
  }, [messages, loading, isScrolledToBottom, initialLoadDone]);

  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const atBottom = scrollHeight - scrollTop <= clientHeight + 1; // +1 for tolerance
    setIsScrolledToBottom(atBottom);

    // Load more messages when scrolled to top
    if (scrollTop === 0 && hasMore && !loading) {
      loadMoreMessages();
    }
  }, [hasMore, loading, loadMoreMessages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await sendMessage(messageText);
    setMessageText('');
    // Force scroll to bottom after sending a message
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const messageElements = messages.map((msg) => {
    const isMe = user && msg.senderId === user.uid;
    return (
      <div key={msg.id} className={`${styles.messageContainer} ${isMe ? styles.alignRight : ''}`}>
        <div className={`${styles.message} ${isMe ? styles.myMessage : styles.otherMessage}`}>
          {!isMe && <strong>{msg.senderName?.split(' ')[0]}:</strong>}
          {msg.message}
        </div>
      </div>
    );
  });

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messageHistory} ref={messagesContainerRef} onScroll={handleScroll}>
        {loading && !initialLoadDone && Array.from({ length: 5 }).map((_, i) => <MessageSkeleton key={i} />)}
        {loading && initialLoadDone && hasMore && (
          <div className={styles.loadingMoreIndicator}>Loading older messages...</div>
        )}
        {!loading && messageElements}
      </div>
      <form onSubmit={handleSubmit} className={styles.messageForm}>
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type your message..."
          className={styles.messageInput}
          disabled={!user}
        />
        <button type="submit" className={styles.sendButton} disabled={!user || !messageText.trim()}>
          <i className="bi bi-send-fill"></i> Send
        </button>
      </form>
      {!user && <p className="text-center mt-2">Please log in to chat.</p>}
    </div>
  );
}