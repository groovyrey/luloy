'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '../../../context/UserContext';
import { showToast } from '../../../utils/toast';
import LoadingMessage from '../../../components/LoadingMessage';

export default function EditMessagePage() {
  const { user } = useUser();
  const router = useRouter();
  const { id } = useParams();
  const [message, setMessage] = useState(null);
  const [sender, setSender] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!user) {
        router.push('/login');
        return;
    }

    const fetchMessage = async () => {
      console.log('User object:', user);
      console.log('User ID token:', user?.idToken);
      try {
        const response = await fetch(`/api/messages/${id}`, {
          headers: {
            'Authorization': `Bearer ${user.idToken}`,
          },
        });
        console.log('Fetch response:', response);
        if (response.ok) {
          const data = await response.json();
          setMessage(data);
          setSender(data.sender);
          setMessageContent(data.message);
        } else {
          const errorData = await response.json();
          console.error('Error fetching message:', errorData);
          showToast(`Failed to fetch message: ${errorData.message}`, 'error');
        }
      } catch (error) {
        console.error('Caught error fetching message:', error);
        showToast('Error fetching message: ' + error.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMessage();
    }
  }, [id, user, router]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/messages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.idToken}`,
        },
        body: JSON.stringify({
          sender,
          message: messageContent,
        }),
      });

      if (response.ok) {
        showToast('Message updated successfully', 'success');
        router.push('/guestbook');
      } else {
        const errorData = await response.json();
        showToast(`Failed to update message: ${errorData.message}`, 'error');
      }
    } catch (error) {
      showToast('Error updating message: ' + error.message, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <LoadingMessage />;
  }

  if (!message) {
    return <p>Message not found.</p>;
  }

  return (
    <div className="container mt-5">
      <div className="card">
        <div className="card-header">
          <h2>Edit Message</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleUpdate}>
            <div className="mb-3">
              <label htmlFor="sender" className="form-label">Sender</label>
              <input
                type="text"
                id="sender"
                className="form-control"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="messageContent" className="form-label">Message</label>
              <textarea
                id="messageContent"
                className="form-control"
                rows="5"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary" disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}