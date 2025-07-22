'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import Link from 'next/link';
import { useUser } from '../../context/UserContext';
import { useRouter } from 'next/navigation';
import LoadingMessage from '../../../app/components/LoadingMessage';

export default function BlobUploadPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [blobUrl, setBlobUrl] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [firestoreDocId, setFirestoreDocId] = useState(null);
  const { theme } = useTheme();
  const { user, userData, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // If user is not logged in, redirect to login
      if (!user) {
        router.push('/login');
        toast.error('You must be logged in to upload resources.');
        return;
      }

      // If user data is loaded and they don't have the staff badge, redirect
      if (userData && (!userData.badges || !userData.badges.includes('staff'))) {
        router.push('/'); // Redirect to home page
        toast.error('Only staff members can upload learning resources.');
      }
    }
  }, [loading, user, userData, router]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setBlobUrl(null);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first.');
      return;
    }

    setUploading(true);
    try {
      const response = await fetch(
        `/api/upload?filename=${encodeURIComponent(file.name)}&title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`,
        {
          method: 'POST',
          body: file,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newBlob = await response.json();
      setBlobUrl(newBlob.url);
      setFirestoreDocId(newBlob.firestoreDocId);
      toast.success('File uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (loading || (user && !userData)) {
    return <LoadingMessage />;
  }

  // Only render the page content if the user is staff
  if (!user || !userData || !userData.badges || !userData.badges.includes('staff')) {
    return null; // Or a simple access denied message if preferred
  }

  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="card" style={{ maxWidth: '600px', width: '100%' }}>
        <div className="card-header">
          <img src="/luloy.svg" alt="Luloy Logo" className="mb-3" style={{ height: '4.5em' }} />
          <h2 className="card-title fw-bold mb-0 fs-3"><span className="bi-cloud-arrow-up"></span>{" "}Upload Learning Resources</h2>
          <p className="mb-0 opacity-75">Upload documents, images, or other files for learning.</p>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label htmlFor="title-input" className="form-label">Title:</label>
            <input type="text" id="title-input" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter title for the resource" disabled={uploading} />
          </div>
          <div className="mb-3">
            <label htmlFor="description-input" className="form-label">Description:</label>
            <textarea id="description-input" className="form-control" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter a brief description" disabled={uploading}></textarea>
          </div>
          <div className="mb-3">
            <label htmlFor="file-input" className="form-label">Select File:</label>
            <input type="file" id="file-input" className="form-control" onChange={handleFileChange} disabled={uploading} />
          </div>
          <button onClick={handleUpload} disabled={uploading || !file} className="btn btn-primary w-100">
            {uploading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              <i className="bi-upload"></i>
            )}{' '}{uploading ? 'Uploading...' : 'Upload File'}
          </button>
          {blobUrl && (
            <div className="text-center mt-3">
              <p className="mb-0">File uploaded to:</p>
              <Link href={blobUrl} target="_blank" rel="noopener noreferrer" className="btn btn-link">
                {blobUrl}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
