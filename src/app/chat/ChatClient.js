
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useChannel, useAbly } from 'ably/react';
import { useUser } from '../context/UserContext';
import styles from './Chat.module.css';
import MessageSkeleton from '../components/MessageSkeleton';

export default function ChatClient() {
  const { user } = useUser();
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const ably = useAbly();

  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const messagesContainerRef = useRef(null);
  const initialLoadRef = useRef(true);

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
        timestamp: msg.createdAt.seconds * 1000,
      })).reverse(); // Reverse to have oldest first for column-reverse layout

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

  useChannel('chat-channel', (message) => {
    // Avoid adding duplicate messages that the user just sent
    if (message.clientId === ably.auth.clientId) {
        const messageExists = messages.some(m => m.data === message.data && m.name === message.name);
        if (messageExists) return;
    }
    setMessages((prev) => [...prev, { ...message, name: message.name || 'Anonymous' }]);
  });

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (container) {
      const isAtTop = container.scrollHeight + container.scrollTop - container.clientHeight < 1;
      if (isAtTop && hasMore && !isLoadingMore) {
        fetchMessages(nextCursor);
      }
    }
  }, [hasMore, isLoadingMore, nextCursor, fetchMessages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      // Invert scroll listener for column-reverse
      const handleInvertedScroll = () => {
        const isAtTop = container.scrollTop >= (container.scrollHeight - container.clientHeight - 1);
        if (isAtTop && hasMore && !isLoadingMore) {
          fetchMessages(nextCursor);
        }
      };
      container.addEventListener('scroll', handleInvertedScroll);
      return () => container.removeEventListener('scroll', handleInvertedScroll);
    }
  }, [handleScroll, hasMore, isLoadingMore, nextCursor, fetchMessages]);
  
  useEffect(() => {
    if (initialLoadRef.current && messages.length > 0) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      initialLoadRef.current = false;
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (messageText.trim() === '') return;

    const optimisticMessage = {
        id: Date.now().toString(), // temporary ID
        name: user?.displayName || 'Anonymous',
        data: messageText,
        timestamp: Date.now(),
    };
    setMessages(prev => [...prev, optimisticMessage]);

    try {
        await Promise.all([
            channel.publish({ name: user?.displayName || 'Anonymous', data: messageText }),
            fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: messageText }),
            })
        ]);
    } catch (error) {
        console.error('Failed to send message:', error);
        // Optional: remove optimistic message on failure
        setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
    }
    setMessageText('');
  };

  const { channel } = useChannel('chat-channel');

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
