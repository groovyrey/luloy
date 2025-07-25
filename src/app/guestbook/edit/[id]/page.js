'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LoadingMessage from '../../../components/LoadingMessage';
import { showToast } from '../../../utils/toast';

export default function EditMessagePage() {
  const params = useParams();
  const { id } = params;
  const router = useRouter();

  const [messageContent, setMessageContent] = useState('');
  const [messageSender, setMessageSender] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    document.title = `Edit Message ${id}`;
    const fetchMessage = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/messages/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setMessageContent(data.message);
        setMessageSender(data.sender || '');
      } catch (error) {
        showToast("Failed to fetch message:", 'error');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchMessage();
    }
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch(`/api/messages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageContent, sender: messageSender }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      showToast('Message updated successfully!', 'success');
      router.push('/guestbook');
    } catch (error) {
      showToast("Failed to save message.", 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingMessage />;
  }

  

  return (
    <div className="container py-5">
      <div className="card">
        <div className="card-header">
          <img src="/luloy.svg" alt="Luloy Logo" className="mb-3" style={{ height: '4.5em' }} />
          <h1 className="card-title fw-bold mb-0 fs-3">Edit Message</h1>
          <p className="mb-0 opacity-75">Editing message with ID: {id}</p>
        </div>
        <div className="card-body">
        
        <form onSubmit={handleSave}>
          <div className="mb-3">
            <label htmlFor="messageContent" className="form-label">Message Content</label>
            <textarea 
              className="form-control" 
              id="messageContent" 
              rows="5" 
              placeholder="Enter your message here..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
            ></textarea>
          </div>
          <div className="mb-3">
            <label htmlFor="messageSender" className="form-label">Sender (Optional)</label>
            <input 
              type="text" 
              className="form-control" 
              id="messageSender" 
              placeholder="Anonymous" 
              value={messageSender}
              onChange={(e) => setMessageSender(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 mt-3" disabled={isSaving}>
            {isSaving ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              null
            )}{' '}{isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
}
