'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

export default function CodeSnippetUploadPage() {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [snippetId, setSnippetId] = useState(null);
  const { theme } = useTheme();
  const fileInputRef = useRef(null);

  const getFileExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
  };

  const languageMap = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    html: 'markup',
    css: 'css',
    json: 'json',
    md: 'markdown',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    h: 'c',
    hpp: 'cpp',
    cxx: 'cpp',
    php: 'php',
    rb: 'ruby',
    go: 'go',
    swift: 'swift',
    kt: 'kotlin',
    sh: 'bash',
    bat: 'batch',
    cmd: 'batch',
    sql: 'sql',
    xml: 'markup',
    yml: 'yaml',
    yaml: 'yaml',
    txt: 'text',
  };

  const MAX_FILE_SIZE_BYTES = 1024 * 1024; // 1MB

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setFile(null);
      setLanguage('');
      setSnippetId(null);
      return;
    }

    // File size validation
    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      toast.error('File size exceeds the 1MB limit.');
      setFile(null);
      setLanguage('');
      setSnippetId(null);
      return;
    }

    // Automatic language detection and file type validation
    const extension = getFileExtension(selectedFile.name);
    const detectedLanguage = languageMap[extension];

    if (detectedLanguage) {
      setLanguage(detectedLanguage);
      setFile(selectedFile);
      setSnippetId(null);
    } else {
      toast.error('Unsupported file type. Please upload a common code file (e.g., .js, .py, .java).');
      setFile(null);
      setLanguage('');
      setSnippetId(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', file.name);
      formData.append('title', file.name); // Using file name as title for code snippets
      formData.append('description', description);
      formData.append('language', language);
      formData.append('type', 'code');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}. Details: ${errorData.details || 'No details provided.'}`);
      }

      const newBlob = await response.json();
      console.log('DEBUG: newBlob object after upload:', newBlob);
      console.log('DEBUG: newBlob.firestoreDocId:', newBlob.firestoreDocId);
      setSnippetId(newBlob.firestoreDocId);
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

  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="card" style={{ maxWidth: '600px', width: '100%' }}>
        <div className="card-header">
          <img src="/luloy.svg" alt="Luloy Logo" className="mb-3" style={{ height: '4.5em' }} />
          <h2 className="card-title fw-bold mb-0 fs-3"><span className="bi-code-slash"></span>{" "}Upload Code Snippet</h2>
          <p className="mb-0 opacity-75">Share your code snippets with the community.</p>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label htmlFor="file-input" className="form-label"><i className="bi-code-slash me-2"></i>Select Code File:</label>
            <input
              id="file-input"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={uploading}
              style={{ display: 'none' }} // Hide the default input
            />
            <button
              type="button"
              className="btn btn-primary w-100 rounded-pill shadow-sm"
              onClick={() => fileInputRef.current.click()}
              disabled={uploading}
            >
              {file ? file.name : 'Choose File'}
            </button>
            <p className="text-muted mt-2" style={{ fontSize: '0.85rem' }}>Max file size: 1MB</p>
          </div>
          <div className="mb-3">
            <label htmlFor="description-input" className="form-label"><i className="bi-file-text me-2"></i>Description:</label>
            <textarea
              id="description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the code"
              rows="3"
              className="form-control"
              disabled={uploading}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="language-select" className="form-label"><i className="bi-translate me-2"></i>Language:</label>
            <select
              id="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="form-select themedSelect"
              disabled={uploading}
            >
              <option value="">Select Language</option>
              {Array.from(new Set(Object.values(languageMap)))
                .sort()
                .map((lang) => (
                  <option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
            </select>
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            onClick={handleUpload}
            disabled={uploading || !file}
          >
            {uploading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              <i className="bi-upload"></i>
            )}{' '}{uploading ? 'Uploading...' : 'Upload Snippet'}
          </button>
          {snippetId && (
            <div className="text-center mt-3">
              <p className="mb-0">Snippet uploaded! You can view it here:</p>
              <Link href={`/code-snippets/${snippetId}`} className="btn btn-link">
                {`/code-snippets/${snippetId}`}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}