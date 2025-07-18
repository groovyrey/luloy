import { useState, useEffect, useRef, useCallback } from 'react';
import { database } from '../../../lib/firebase';
import { ref, query, orderByChild, limitToLast, onValue, off, onChildAdded, onChildChanged, onChildRemoved, endBefore } from 'firebase/database';

const INITIAL_MESSAGE_LOAD_COUNT = 8;
const LOAD_MORE_COUNT = 5;

export const useMessages = (user, userLoading, refreshUserData, messagesContainerRef) => {
    const [messages, setMessages] = useState([]);
    const [messagesLoading, setMessagesLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const oldestMessageTimestamp = useRef(null);

    // TODO: Robust Offline Support: For more comprehensive offline capabilities, consider using IndexedDB
    // or a dedicated offline-first library for more persistent and larger data storage.
    const getMessagesFromCache = () => {
        try {
            
            return cachedMessages ? JSON.parse(cachedMessages) : [];
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return [];
        }
    };

    const saveMessagesToCache = (messagesToSave) => {
        try {
            
        } catch (error) {
            console.error('Error writing to localStorage:', error);
        }
    };

    const loadMoreMessages = useCallback(() => {
        if (!hasMore || !user || messagesLoading) return;

        setMessagesLoading(true);
        const messagesRef = ref(database, 'messages');
        const messagesQuery = query(
            messagesRef,
            orderByChild('timestamp'),
            endBefore(oldestMessageTimestamp.current),
            limitToLast(LOAD_MORE_COUNT)
        );

        // Store current scroll state before fetching new messages
        const oldScrollHeight = messagesContainerRef.current?.scrollHeight;
        const oldScrollTop = messagesContainerRef.current?.scrollTop;

        onValue(messagesQuery, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const newOlderMessages = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                })).sort((a, b) => a.timestamp - b.timestamp);

                if (newOlderMessages.length < LOAD_MORE_COUNT) {
                    setHasMore(false);
                }

                if (newOlderMessages.length > 0) {
                    oldestMessageTimestamp.current = newOlderMessages[0].timestamp;
                }

                setMessages(prevMessages => [...newOlderMessages, ...prevMessages]);

                // After messages are rendered, adjust scroll position
                // Use a setTimeout to ensure DOM has updated
                setTimeout(() => {
                    if (messagesContainerRef.current && oldScrollHeight !== undefined && oldScrollTop !== undefined) {
                        const newScrollHeight = messagesContainerRef.current.scrollHeight;
                        messagesContainerRef.current.scrollTop = newScrollHeight - oldScrollHeight + oldScrollTop;
                    }
                }, 0);

            } else {
                setHasMore(false);
            }
            setMessagesLoading(false);
        }, { onlyOnce: true });
    }, [hasMore, user, messagesLoading, messagesContainerRef]);

    useEffect(() => {
        if (!userLoading && user) {
            

            const messagesRef = ref(database, 'messages');

            setMessagesLoading(true);

            const initialQuery = query(
                messagesRef,
                orderByChild('timestamp'),
                limitToLast(INITIAL_MESSAGE_LOAD_COUNT)
            );

            const unsubscribeInitial = onValue(initialQuery, (snapshot) => {
                const data = snapshot.val();
                let firebaseMessages = [];
                if (data) {
                    firebaseMessages = Object.keys(data).map(key => ({
                        id: key,
                        ...data[key]
                    })).sort((a, b) => a.timestamp - b.timestamp);
                }

                setMessages(firebaseMessages);
                saveMessagesToCache(firebaseMessages);

                if (firebaseMessages.length > 0) {
                    oldestMessageTimestamp.current = firebaseMessages[0].timestamp;
                }
                setTimeout(() => {
                    messagesContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 0);
                setMessagesLoading(false);
            }, { onlyOnce: true });

            
            const onChildAddedListener = onChildAdded(messagesRef, (snapshot) => {
                const newMessage = { id: snapshot.key, ...snapshot.val() };
                setMessages(prevMessages => {
                    if (prevMessages.some(msg => msg.id === newMessage.id)) {
                        return prevMessages;
                    }
                    const updatedMessages = [...prevMessages, newMessage].sort((a, b) => a.timestamp - b.timestamp);
                    saveMessagesToCache(updatedMessages);
                    if (messagesContainerRef.current) {
                        const { scrollHeight, scrollTop, clientHeight } = messagesContainerRef.current;
                        // Only scroll to bottom if the user is already at the bottom or very close
                        if (scrollHeight - scrollTop - clientHeight < 20) { // 20px tolerance
                            messagesContainerRef.current.scrollTop = scrollHeight;
                        }
                    }
                    return updatedMessages;
                });
            });

            const onChildChangedListener = onChildChanged(messagesRef, (snapshot) => {
                const updatedMessage = { id: snapshot.key, ...snapshot.val() };
                setMessages(prevMessages => {
                    const newMessages = prevMessages.map(msg => (msg.id === updatedMessage.id ? updatedMessage : msg));
                    saveMessagesToCache(newMessages);
                    return newMessages;
                });
            });

            const onChildRemovedListener = onChildRemoved(messagesRef, (snapshot) => {
                const deletedMessageId = snapshot.key;
                setMessages(prevMessages => {
                    const newMessages = prevMessages.filter(msg => msg.id !== deletedMessageId);
                    saveMessagesToCache(newMessages);
                    return newMessages;
                });
            });

            return () => {
                unsubscribeInitial();
                off(messagesRef, 'child_added', onChildAddedListener);
                off(messagesRef, 'child_changed', onChildChangedListener);
                off(messagesRef, 'child_removed', onChildRemovedListener);
            };
        }
    }, [user, userLoading, refreshUserData, messagesContainerRef]);

    return { messages, messagesLoading, hasMore, loadMoreMessages };
};