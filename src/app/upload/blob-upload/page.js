'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

export default function BlobUploadPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [blobUrl, setBlobUrl] = useState(null);
  const { theme } = useTheme();

  const containerStyle = {
    padding: '20px',
    maxWidth: '500px',
    margin: '20px auto',
    textAlign: 'center',
    color: theme === 'dark' ? '#eee' : '#333',
  };

  const fileInputStyle = {
    marginBottom: '10px',
    width: '100%',
    boxSizing: 'border-box',
    display: 'block',
  };

  const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    opacity: uploading ? 0.7 : 1
  };

  const linkStyle = {
    color: theme === 'dark' ? '#90caf9' : '#0070f3',
    wordBreak: 'break-all'
  };

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
        `/api/upload?filename=${encodeURIComponent(file.name)}`,
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
      toast.success('File uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card" style={containerStyle}>
      <h2>Upload Learning Resources</h2>
      <input type="file" onChange={handleFileChange} disabled={uploading} style={fileInputStyle} />
      <button onClick={handleUpload} disabled={uploading || !file} style={buttonStyle}>
        {uploading ? 'Uploading...' : 'Upload File'}
      </button>
      {blobUrl && (
        <div style={{ marginTop: '20px' }}>
          <p>File uploaded to:</p>
          <a href={blobUrl} target="_blank" rel="noopener noreferrer" style={linkStyle}>
            {blobUrl}
          </a>
        </div>
      )}
    </div>
  );
}