
'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { database } from '../../../lib/firebase';
import { ref, remove, update, get } from 'firebase/database';
import ChatMessage from '../components/ChatMessage';
import MessageSkeleton from '../components/MessageSkeleton';
import LoadingMessage from '../components/LoadingMessage';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { initializeTooltips, disposeTooltips } from '../BootstrapClient';
import ChatInput from '../components/ChatInput';
import styles from './chat.module.css';
import { useMessages } from '../hooks/useMessages';

export default function ChatPage() {
    const { user, loading: userLoading, refreshUserData } = useUser();
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editingMessageOriginalText, setEditingMessageOriginalText] = useState('');
    const router = useRouter();

    const messagesContainerRef = useRef(null);

    const { messages, messagesLoading, hasMore, loadMoreMessages } = useMessages(user, userLoading, refreshUserData, messagesContainerRef);

    useEffect(() => {
        const container = messagesContainerRef.current;
        const handleScroll = () => {
            if (container.scrollTop + container.clientHeight >= container.scrollHeight - 5 && !messagesLoading && hasMore) {
                loadMoreMessages();
            }
        };

        container?.addEventListener('scroll', handleScroll);
        return () => container?.removeEventListener('scroll', handleScroll);
    }, [messagesLoading, loadMoreMessages, hasMore, messagesContainerRef]);

    useEffect(() => {
        const timer = setTimeout(() => {
            initializeTooltips();
        }, 100);

        return () => {
            clearTimeout(timer);
            disposeTooltips();
        };
    }, [messages]);

    useEffect(() => {
        document.title = "Chat";
        if (!userLoading && !user) {
            toast.error('You must be logged in to access the chat.');
            router.push('/login');
            return;
        }
    }, [user, userLoading, router]);

    const handleDeleteMessage = async (messageId) => {
        try {
            await remove(ref(database, `messages/${messageId}`));
            toast.success('Message deleted successfully!');
        } catch (error) {
            console.error('Error deleting message:', error);
            toast.error('Failed to delete message.');
        }
    };

    const [replyingToMessage, setReplyingToMessage] = useState(null);

    const handleEditMessage = (messageToEdit) => {
        setEditingMessageId(messageToEdit.id);
        setEditingMessageOriginalText(messageToEdit.text);
        setReplyingToMessage(null); // Cancel reply when editing
    };

    const handleReplyToMessage = (messageToReplyTo) => {
        setReplyingToMessage(messageToReplyTo);
        setEditingMessageId(null); // Cancel edit when replying
    };

    const handleReactToMessage = async (messageId, emoji) => {
        if (!user) {
            toast.error('You must be logged in to react.');
            return;
        }
        const messageRef = ref(database, `messages/${messageId}/reactions`);
        const userId = user.uid;

        try {
            const messageSnapshot = await get(ref(database, `messages/${messageId}`));
            const currentMessage = messageSnapshot.val();
            const currentReactions = currentMessage?.reactions || {};
            const newReactions = { ...currentReactions };

            let hasReactedWithCurrentEmoji = newReactions[emoji] && newReactions[emoji][userId];
            let existingReactionEmoji = null;

            // Find if the user has reacted with any other emoji
            for (const [existingEmoji, userIdsObject] of Object.entries(currentReactions)) {
                if (existingEmoji !== emoji && userIdsObject && userIdsObject[userId]) {
                    existingReactionEmoji = existingEmoji;
                    break;
                }
            }

            if (hasReactedWithCurrentEmoji) {
                // User clicked the same emoji, so remove their reaction
                delete newReactions[emoji][userId];
                if (Object.keys(newReactions[emoji]).length === 0) {
                    delete newReactions[emoji];
                }
            } else {
                // If user reacted with a different emoji, remove the old one first
                if (existingReactionEmoji) {
                    delete newReactions[existingReactionEmoji][userId];
                    if (Object.keys(newReactions[existingReactionEmoji]).length === 0) {
                        delete newReactions[existingReactionEmoji];
                    }
                }

                // Add the new reaction
                if (!newReactions[emoji]) {
                    newReactions[emoji] = {};
                }
                newReactions[emoji][userId] = true;
            }

            await update(ref(database, `messages/${messageId}`), { reactions: newReactions });
        } catch (error) {
            console.error('Error reacting to message:', error);
            toast.error('Failed to add/remove reaction.');
        }
    };

    return (
        <div className="d-flex flex-column vh-100">
            <div className="d-flex flex-column h-100">
                <div ref={messagesContainerRef} className="container chat-container flex-grow-1 d-flex flex-column-reverse pt-10 pb-3" style={{ overflowY: 'auto' }}>
                    {messagesLoading && [...Array(5)].map((_, i) => <MessageSkeleton key={i} isMyMessage={i % 2 === 0} />)}
                    {messages.slice().reverse().map((msg) => (
                        <ChatMessage
                            key={msg.id}
                            message={msg}
                            user={user}
                            onDelete={handleDeleteMessage}
                            onEdit={handleEditMessage}
                            onReply={handleReplyToMessage}
                            onReact={handleReactToMessage}
                        />
                    ))}
                </div>
                <div className="p-3">
                    <ChatInput
                        user={user}
                        editingMessageId={editingMessageId}
                        editingMessageOriginalText={editingMessageOriginalText}
                        setEditingMessageId={setEditingMessageId}
                        setEditingMessageOriginalText={setEditingMessageOriginalText}
                        replyingToMessage={replyingToMessage}
                        setReplyingToMessage={setReplyingToMessage}
                    />
                </div>
            </div>
        </div>
    );
}
