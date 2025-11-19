'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useChannel, useAbly } from 'ably/react';
import { UserContext } from '../context/UserContext';
import styles from './Chat.module.css';

export default function ChatClient() {
  const { user, loading } = useContext(UserContext);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const ably = useAbly();

  const { channel } = useChannel('chat-channel', (message) => {
    setMessages((prev) => [...prev, message]);
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (messageText.trim() === '') return;
    channel.publish({ name: user?.displayName || 'Anonymous', data: messageText });
    setMessageText('');
  };

  const messageElements = messages.map((msg, index) => (
    <div key={index} className={styles.message}>
      <strong>{msg.name}:</strong> {msg.data}
    </div>
  ));

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messageHistory}>{messageElements}</div>
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
          Send
        </button>
      </form>
      {!user && <p className="text-center mt-2">Please log in to chat.</p>}
    </div>
  );
}
