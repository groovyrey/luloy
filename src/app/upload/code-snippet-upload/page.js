'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

export default function CodeSnippetUploadPage() {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [snippetId, setSnippetId] = useState(null);
  const { theme } = useTheme();

  const containerStyle = {
    padding: '20px',
    maxWidth: '600px',
    margin: '20px auto',
    textAlign: 'center',
    color: theme === 'dark' ? '#eee' : '#333',
  };

  const inputStyle = {
    width: '100%',
    padding: '8px',
    boxSizing: 'border-box',
    backgroundColor: theme === 'dark' ? '#555' : '#fff',
    color: theme === 'dark' ? '#eee' : '#333',
    border: theme === 'dark' ? '1px solid #666' : '1px solid #ccc',
    borderRadius: '4px',
  };

  const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#28a745',
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
    setSnippetId(null);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first.');
      return;
    }

    setUploading(true);
    try {
      // Step 1: Upload file to Vercel Blob
      const blobResponse = await fetch(
        `/api/upload?filename=${encodeURIComponent(file.name)}`,
        {
          method: 'POST',
          body: file,
        }
      );

      if (!blobResponse.ok) {
        throw new Error(`Blob upload failed: ${blobResponse.statusText}`);
      }

      const newBlob = await blobResponse.json();
      const codeBlobUrl = newBlob.url;

      // Step 2: Save snippet metadata to Firestore
      const metadataResponse = await fetch('/api/code-snippets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file.name,
          language,
          description,
          codeBlobUrl,
        }),
      });

      if (!metadataResponse.ok) {
        throw new Error(`Metadata save failed: ${metadataResponse.statusText}`);
      }

      const metadataResult = await metadataResponse.json();
      setSnippetId(metadataResult.snippetId);
      toast.success('Code snippet uploaded and saved successfully!');

      // Clear form
      setFile(null);
      setDescription('');
      setLanguage('');

    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const fileInputStyle = {
    marginBottom: '10px',
    width: '100%',
    boxSizing: 'border-box',
    display: 'block',
    backgroundColor: theme === 'dark' ? '#555' : '#fff',
    color: theme === 'dark' ? '#eee' : '#333',
    border: theme === 'dark' ? '1px solid #666' : '1px solid #ccc',
    borderRadius: '4px',
  };

  return (
    <div className="card" style={containerStyle}>
      <h2>Upload Code Snippet</h2>
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="file-input" style={{ display: 'block', marginBottom: '5px' }}>Select Code File:</label>
        <input id="file-input" type="file" onChange={handleFileChange} disabled={uploading} style={fileInputStyle} />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="description-input" style={{ display: 'block', marginBottom: '5px' }}>Description:</label>
        <textarea
          id="description-input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the code"
          rows="3"
          style={inputStyle}
          disabled={uploading}
        />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="language-input" style={{ display: 'block', marginBottom: '5px' }}>Language (e.g., javascript, python):</label>
        <input
          id="language-input"
          type="text"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          placeholder="e.g., javascript, python, java"
          style={inputStyle}
          disabled={uploading}
        />
      </div>
      <button onClick={handleUpload} disabled={uploading || !file} style={buttonStyle}>
        {uploading ? 'Uploading...' : 'Upload Snippet'}
      </button>
      {snippetId && (
        <div style={{ marginTop: '20px' }}>
          <p>Snippet uploaded! ID:</p>
          <p style={{ fontWeight: 'bold' }}>{snippetId}</p>
          {/* You might want to add a link to view the snippet here later */}
        </div>
      )}
    </div>
  );
}