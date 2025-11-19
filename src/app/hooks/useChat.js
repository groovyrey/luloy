
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { database } from '../../../lib/firebase';
import { ref, push, serverTimestamp, query, orderByChild, limitToLast, onValue, off } from 'firebase/database';

const MESSAGES_COLLECTION = 'public-chat';

export const useChat = () => {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const oldestMessageTimestamp = useRef(null);

  const messagesRef = ref(database, MESSAGES_COLLECTION);

  const processMessages = (messageData) => {
    if (!messageData) return [];
    return Object.keys(messageData)
      .map(key => ({ id: key, ...messageData[key] }))
      .sort((a, b) => a.createdAt - b.createdAt);
  };

  const loadInitialMessages = useCallback(() => {
    setLoading(true);
    const initialQuery = query(messagesRef, orderByChild('createdAt'), limitToLast(20));

    onValue(initialQuery, (snapshot) => {
      const loadedMessages = processMessages(snapshot.val());
      setMessages(loadedMessages);
      if (loadedMessages.length > 0) {
        oldestMessageTimestamp.current = loadedMessages[0].createdAt;
      }
      setHasMore(loadedMessages.length === 20);
      setLoading(false);
    }, { onlyOnce: true });
  }, [messagesRef]);

  useEffect(() => {
    loadInitialMessages();

    const recentMessagesQuery = query(messagesRef, orderByChild('createdAt'), limitToLast(1));
    const listener = onValue(recentMessagesQuery, (snapshot) => {
      const newMessages = processMessages(snapshot.val());
      if (newMessages.length > 0) {
        const newMessage = newMessages[0];
        setMessages(prev => {
          if (!prev.some(m => m.id === newMessage.id)) {
            return [...prev, newMessage];
          }
          return prev;
        });
      }
    });

    return () => off(messagesRef, 'value', listener);
  }, [loadInitialMessages, messagesRef]);

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || !user) return;

    const newMessage = {
      senderId: user.uid,
      senderName: user.firstName || 'Anonymous',
      message: messageText,
      createdAt: serverTimestamp(),
    };

    try {
      await push(messagesRef, newMessage);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return { messages, loading, sendMessage, hasMore };
};
