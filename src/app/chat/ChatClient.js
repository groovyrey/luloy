
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useChannel } from 'ably/react';
import { useUser } from '../context/UserContext';
import styles from './Chat.module.css';
import MessageSkeleton from '../components/MessageSkeleton';

export default function ChatClient() {
  const { user } = useUser();
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const { channel } = useChannel('chat-channel', (message) => {
    setMessages((prev) => [...prev, { id: message.id, name: message.name || 'Anonymous', data: message.data }]);
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = useCallback(async (cursor) => {
    if (!hasMore && cursor) return;
    
    cursor ? setIsLoadingMore(true) : setIsLoading(true);

    try {
      const url = cursor ? `/api/chat?limit=5&cursor=${cursor}` : '/api/chat?limit=5';
      const response = await fetch(url);
      const data = await response.json();

      const formattedMessages = data.messages.map(msg => ({
        id: msg.id,
        name: msg.senderName,
        data: msg.message,
      })).reverse();

      setMessages(prev => [...formattedMessages, ...prev]);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      cursor ? setIsLoadingMore(false) : setIsLoading(false);
    }
  }, [hasMore]);

  useEffect(() => {
    fetchMessages(null);
  }, [fetchMessages]);

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (container) {
      const isAtTop = container.scrollTop === 0;
      if (isAtTop && hasMore && !isLoadingMore) {
        fetchMessages(nextCursor);
      }
    }
  }, [hasMore, isLoadingMore, nextCursor, fetchMessages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (messageText.trim() === '') return;

    try {
        await channel.publish({ name: user?.displayName || 'Anonymous', data: messageText });
        await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: messageText }),
        });
    } catch (error) {
        console.error('Failed to send message:', error);
    }
    setMessageText('');
  };

  const messageElements = messages.map((msg) => (
    <div key={msg.id} className={styles.message}>
      <strong>{msg.name}:</strong> {msg.data}
    </div>
  ));

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messageHistory} ref={messagesContainerRef}>
        {isLoading && Array.from({ length: 5 }).map((_, i) => <MessageSkeleton key={i} />)}
        {isLoadingMore && <div className={styles.loadingMore}><MessageSkeleton /></div>}
        {messageElements}
        <div ref={messagesEndRef} />
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
          Send
        </button>
      </form>
      {!user && <p className="text-center mt-2">Please log in to chat.</p>}
    </div>
  );
}
