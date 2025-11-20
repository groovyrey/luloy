
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useUser } from '../context/UserContext';
import { database } from '../../../lib/firebase';
import { ref, push, serverTimestamp, query, orderByChild, limitToLast, onValue, off, get, remove, onChildAdded, endBefore } from 'firebase/database';

const MESSAGES_COLLECTION = 'messages';
const MESSAGE_LIMIT = 50;

export const useChat = () => {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const oldestMessageTimestamp = useRef(null);

  const messagesRef = useMemo(() => ref(database, MESSAGES_COLLECTION), []);

  const processMessages = (messageData) => {
    if (!messageData) return [];
    console.log('Raw message data:', messageData);
    const processed = Object.keys(messageData)
      .map(key => ({ id: key, ...messageData[key] }))
      .sort((a, b) => a.createdAt - b.createdAt);
    console.log('Processed messages:', processed);
    return processed;
  };

  useEffect(() => {
    setLoading(true);
    const initialQuery = query(messagesRef, orderByChild('createdAt'), limitToLast(MESSAGE_LIMIT));

    // Initial messages listener
    const unsubscribeInitial = onValue(initialQuery, (snapshot) => {
      try {
        console.log('Initial snapshot received:', snapshot.val());
        const val = snapshot.val();
        if (val) {
          const loadedMessages = processMessages(val);
          setMessages(loadedMessages);
          if (loadedMessages.length > 0) {
            oldestMessageTimestamp.current = loadedMessages[0].createdAt;
          }
          setHasMore(loadedMessages.length === MESSAGE_LIMIT);
        } else {
          setMessages([]);
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error processing initial messages:", error);
      } finally {
        setLoading(false);
      }
    }, { onlyOnce: true });

    // New message listener
    const onChildAddedListener = onChildAdded(messagesRef, (snapshot) => {
      console.log('New message added:', snapshot.val());
      const newMessage = { id: snapshot.key, ...snapshot.val() };
      setMessages(prev => {
        if (prev.some(m => m.id === newMessage.id)) {
          return prev;
        }
        const updatedMessages = [...prev, newMessage]
          .sort((a, b) => a.createdAt - b.createdAt)
          .slice(-MESSAGE_LIMIT);
        return updatedMessages;
      });
    });

    return () => {
      unsubscribeInitial();
      off(messagesRef, 'child_added', onChildAddedListener);
    };
  }, [messagesRef]);

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

      // The client-side message limit enforcement is removed from here.
      // Database-level enforcement should ideally be done via Firebase Security Rules or Cloud Functions.
      // The local state limit is handled by the onChildAdded listener.

    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const loadMoreMessages = useCallback(async () => {
    if (!hasMore || loading) return; // Prevent multiple loads or loading when no more messages

    setLoading(true);
    try {
      const moreMessagesQuery = query(
        messagesRef,
        orderByChild('createdAt'),
        endBefore(oldestMessageTimestamp.current),
        limitToLast(MESSAGE_LIMIT)
      );

      const snapshot = await get(moreMessagesQuery);
      const val = snapshot.val();

      if (val) {
        const loadedMessages = processMessages(val);
        setMessages(prev => [...loadedMessages, ...prev]);
        if (loadedMessages.length > 0) {
          oldestMessageTimestamp.current = loadedMessages[0].createdAt;
        }
        setHasMore(loadedMessages.length === MESSAGE_LIMIT);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, messagesRef]);

  return { messages, loading, sendMessage, hasMore, loadMoreMessages };
};
