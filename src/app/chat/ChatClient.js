'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { useChat } from '../hooks/useChat';
import styles from './Chat.module.css';
import MessageSkeleton from '../components/MessageSkeleton';

export default function ChatClient() {
  const { user } = useUser();
  const { messages, loading, sendMessage } = useChat();
  const [messageText, setMessageText] = useState('');
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await sendMessage(messageText);
    setMessageText('');
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
      <div className={styles.messageHistory} ref={messagesContainerRef}>
        {loading && Array.from({ length: 5 }).map((_, i) => <MessageSkeleton key={i} />)}
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
        <button type="submit" className={styles.sendButton} disabled={!user}>
          <i className="bi bi-send-fill"></i> Send
        </button>
      </form>
      {!user && <p className="text-center mt-2">Please log in to chat.</p>}
    </div>
  );
}