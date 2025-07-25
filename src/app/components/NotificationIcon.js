
'use client';

import { useState, useEffect, useContext } from 'react';
import { Bell, BellFill } from 'react-bootstrap-icons';
import { Dropdown, Badge } from 'react-bootstrap';
import { UserContext } from '@/context/UserContext';
import Link from 'next/link';
import styles from './NotificationIcon.module.css';

const NotificationIcon = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useContext(UserContext);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await fetch('/api/notifications/mark-as-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });
      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-as-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  if (!user) return null;

  return (
    <Dropdown align="end">
      <Dropdown.Toggle as="a" className={styles.dropdownToggle}>
        {unreadCount > 0 ? <BellFill /> : <Bell />}
        {unreadCount > 0 && <Badge pill bg="danger" className={styles.badge}>{unreadCount}</Badge>}
      </Dropdown.Toggle>

      <Dropdown.Menu className={styles.dropdownMenu}>
        <div className={styles.header}>
          <h5>Notifications</h5>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} className={styles.markAllReadButton}>
              Mark all as read
            </button>
          )}
        </div>
        <Dropdown.Divider />
        {notifications.length === 0 ? (
          <Dropdown.Item as="div" className={styles.noNotifications}>
            No notifications yet.
          </Dropdown.Item>
        ) : (
          notifications.map(notification => (
            <Link href={notification.link} passHref key={notification.id}>
              <Dropdown.Item 
                as="a" 
                className={`${styles.notificationItem} ${notification.read ? styles.read : ''}`}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
              >
                <p>{notification.message}</p>
                <small>{new Date(notification.createdAt).toLocaleString()}</small>
              </Dropdown.Item>
            </Link>
          ))
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationIcon;
