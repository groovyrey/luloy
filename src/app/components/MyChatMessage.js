'use client';

'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

import { motion } from 'framer-motion';

import { useUser } from '../context/UserContext';
import { AUTH_LEVEL_RANKS } from '../utils/AuthRankSystem';
import MessageOptionsModal from './MessageOptionsModal';
import { capitalizeName } from '../utils/capitalizeName';
import styles from './ChatMessage.module.css';

export default function MyChatMessage({ message, user, onDelete, onEdit, onReply, onReact, onMessageRendered, isPreview = false }) {
    const { allUsersData, fetchAndStoreUserData } = useUser();
    const messageCardRef = useRef(null);
    const [showModal, setShowModal] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const holdTimeoutRef = useRef(null);
    const [senderAuthLevel, setSenderAuthLevel] = useState(message.senderAuthLevel);

    const handleTouchStart = (e) => {
        if (isPreview) return; // Disable for preview messages
        e.preventDefault(); // Prevent default to avoid text selection on long press
        holdTimeoutRef.current = setTimeout(() => {
            setShowModal(true);
        }, 1000); // 1000ms for a "hold"
    };

    const handleTouchEnd = () => {
        if (isPreview) return; // Disable for preview messages
        clearTimeout(holdTimeoutRef.current);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    useEffect(() => {
        if (onMessageRendered) {
            onMessageRendered();
        }
    }, [message, onMessageRendered]);

    useEffect(() => {
        const fetchSenderAuthLevel = async () => {
            if (message.senderId) {
                await fetchAndStoreUserData(message.senderId);
                if (allUsersData[message.senderId]) {
                    setSenderAuthLevel(allUsersData[message.senderId].authLevel);
                }
            }
        };
        fetchSenderAuthLevel();
    }, [message.senderId, allUsersData, fetchAndStoreUserData]);

    useEffect(() => {
        if (message.reactions) {
            Object.values(message.reactions).forEach(users => {
                Object.keys(users).forEach(userId => {
                    fetchAndStoreUserData(userId);
                });
            });
        }
    }, [message.reactions, fetchAndStoreUserData]);

    return (
        <motion.div
            className={`d-flex justify-content-end mb-1 position-relative`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                ref={messageCardRef}
                className={`${styles.messageCard} ${styles.myMessage}`}
                onMouseDown={handleTouchStart}
                onMouseUp={handleTouchEnd}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onMouseLeave={handleTouchEnd} // Clear timeout if mouse leaves while holding
                >
                <div className="d-flex flex-column">
                    {message.replyTo && (
                        <motion.div
                            className="border-start border-info ps-2 mb-2"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <small className="text-info fw-bold">Replying to {message.replyTo.senderName}:</small>
                            <p className="text-muted mb-0 small text-truncate">{message.replyTo.text}</p>
                        </motion.div>
                    )}
                    <small className="fw-bold mb-1">
                        {message.senderUsername || capitalizeName(message.senderName)} {AUTH_LEVEL_RANKS[senderAuthLevel] && <i className={`${AUTH_LEVEL_RANKS[senderAuthLevel].icon} ${AUTH_LEVEL_RANKS[senderAuthLevel].color}`}></i>}
                    </small>
                    <p className="mb-0">{message.text} {message.isEdited && <small className="text-muted">(Edited)</small>}</p>
                    <div className="d-flex align-items-center mt-2">
                        {message.reactions && (
                            <div className="d-flex me-2">
                                {Object.entries(message.reactions)
                                    .filter(([emoji]) => emoji !== null && emoji !== undefined && emoji !== 'null' && emoji !== 'undefined')
                                    .map(([emoji, users]) => (
                                        <motion.span
                                            key={emoji}
                                            className={`${styles.badgeWithTooltip} badge bg-light text-dark me-1`}
                                            style={{ cursor: 'pointer' }}
                                            variants={{
                                                visible: { opacity: 1, scale: 1 },
                                                hidden: { opacity: 0, scale: 0.8 },
                                            }}
                                            whileTap={{ scale: 1.2 }}
                                            onClick={() => onReact(message.id, emoji)} // Moved onClick here
                                        >
                                            {emoji} {Object.keys(users).length}
                                        </motion.span>
                                    ))}
                            </div>
                        )}
                        {isHovered && !isPreview && (
                            <motion.button
                                className={`btn btn-sm ${styles.transparentButton}`}
                                onClick={() => setShowModal(true)} // This now only opens the modal
                                whileTap={{ scale: 0.9 }}
                            >
                                <i className="fas fa-plus"></i>
                            </motion.button>
                        )}
                    </div>
                </div>
                
            </div>
            <MessageOptionsModal
                show={showModal}
                onHide={handleCloseModal}
                onDelete={onDelete}
                onEdit={onEdit}
                onReply={onReply}
                message={message}
                user={user}
            />
        </motion.div>
    );
}