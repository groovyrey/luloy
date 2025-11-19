
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { database } from '../../../lib/firebase';
import { ref, push, serverTimestamp, query, orderByChild, limitToLast, onValue, off, get, remove, onChildAdded } from 'firebase/database';

const MESSAGES_COLLECTION = 'public-chat';
const MESSAGE_LIMIT = 50;

export const useChat = () => {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const oldestMessageTimestamp = useRef(null);

  const messagesRef = ref(database, MESSAGES_COLLECTION);

  const processMessages = (messageData) => {
    if (!messageData) return [];
    console.log('Raw message data:', messageData);
    const processed = Object.keys(messageData)
      .map(key => ({ id: key, ...messageData[key] }))
      .sort((a, b) => a.createdAt - b.createdAt);
    console.log('Processed messages:', processed);
    return processed;
  };

  const loadInitialMessages = useCallback(() => {
    setLoading(true);
    const initialQuery = query(messagesRef, orderByChild('createdAt'), limitToLast(MESSAGE_LIMIT));

    const unsubscribe = onValue(initialQuery, (snapshot) => {
      try {
        console.log('Initial snapshot received:', snapshot.val());
        const loadedMessages = processMessages(snapshot.val());
        setMessages(loadedMessages);
        if (loadedMessages.length > 0) {
          oldestMessageTimestamp.current = loadedMessages[0].createdAt;
        }
        setHasMore(loadedMessages.length === MESSAGE_LIMIT);
      } catch (error) {
        console.error("Error processing initial messages:", error);
      } finally {
        setLoading(false);
      }
    }, { onlyOnce: true });

    return unsubscribe; // Return unsubscribe function
  }, [messagesRef]);

  useEffect(() => {
    const unsubscribeInitial = loadInitialMessages();

    const onChildAddedListener = onChildAdded(messagesRef, (snapshot) => {
      console.log('New message added:', snapshot.val());
      const newMessage = { id: snapshot.key, ...snapshot.val() };
      setMessages(prev => {
        // Ensure no duplicates and maintain limit
        const updatedMessages = [...prev, newMessage]
          .sort((a, b) => a.createdAt - b.createdAt)
          .slice(-MESSAGE_LIMIT); // Keep only the last MESSAGE_LIMIT messages
        return updatedMessages;
      });
    });

    return () => {
      unsubscribeInitial();
      off(messagesRef, 'child_added', onChildAddedListener);
    };
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

      // Enforce message limit (this will be handled by the onChildAdded listener more robustly)
      // This client-side check is a fallback/immediate enforcement
      const snapshot = await get(query(messagesRef, orderByChild('createdAt')));
      const allMessages = processMessages(snapshot.val());

      if (allMessages.length > MESSAGE_LIMIT) {
        const oldestMessage = allMessages[0];
        await remove(ref(database, `${MESSAGES_COLLECTION}/${oldestMessage.id}`));
        console.log('Removed oldest message:', oldestMessage.id);
      }

    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return { messages, loading, sendMessage, hasMore };
};
