'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../../context/ThemeContext';
import styles from './EditCodeSnippetPage.module.css'; // Assuming a new CSS module for this page

export default function EditCodeSnippetPage() {
  const params = useParams();
  const router = useRouter();
  const { snippetId } = params;
  const { theme } = useTheme();

  const [filename, setFilename] = useState('');
  const [description, setDescription] = useState('');
  const [codeContent, setCodeContent] = useState('');
  const [language, setLanguage] = useState(''); // Language will be displayed but not editable directly
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    if (snippetId) {
      const fetchSnippet = async () => {
        try {
          const res = await fetch(`/api/code-snippets/${snippetId}`);
          if (!res.ok) {
            throw new Error(`Failed to fetch snippet: ${res.status}`);
          }
          const data = await res.json();

          setFilename(data.filename || '');
          setDescription(data.description || '');
          setLanguage(data.language || 'unknown');

          if (data.codeBlobUrl) {
            const codeRes = await fetch(data.codeBlobUrl);
            if (!codeRes.ok) {
              throw new Error(`Failed to fetch code content: ${codeRes.status}`);
            }
            const content = await codeRes.text();
            setCodeContent(content);
          } else {
            toast.error('Code content URL not found for this snippet.');
          }
        } catch (err) {
          console.error('Error fetching code snippet for editing:', err);
          toast.error(err.message || 'Failed to load snippet for editing.');
          router.push(`/code-snippets/${snippetId}`); // Redirect back if fetch fails
        } finally {
          setLoading(false);
        }
      };
      fetchSnippet();
    }
  }, [snippetId, router]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Step 1: If code content changed, re-upload to Vercel Blob
      let newCodeBlobUrl = null;
      const originalCodeContent = await (await fetch(`/api/code-snippets/${snippetId}`)).json().then(data => fetch(data.codeBlobUrl).then(res => res.text()));

      if (codeContent !== originalCodeContent) {
        // Create a Blob from the updated code content
        const codeBlob = new Blob([codeContent], { type: 'text/plain' });
        const fileToUpload = new File([codeBlob], filename, { type: 'text/plain' });

        const blobResponse = await fetch(
          `/api/upload?filename=${encodeURIComponent(filename)}`,
          {
            method: 'POST',
            body: fileToUpload,
          }
        );

        if (!blobResponse.ok) {
          throw new Error(`Blob re-upload failed: ${blobResponse.statusText}`);
        }
        const newBlob = await blobResponse.json();
        newCodeBlobUrl = newBlob.url;
      }

      // Step 2: Update snippet metadata in Firestore
      const updateData = {
        filename,
        description,
      };

      if (newCodeBlobUrl) {
        updateData.codeBlobUrl = newCodeBlobUrl;
      }

      const metadataResponse = await fetch(`/api/code-snippets/${snippetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!metadataResponse.ok) {
        throw new Error(`Metadata update failed: ${metadataResponse.statusText}`);
      }

      toast.success('Code snippet updated successfully!');
      router.push(`/code-snippets/${snippetId}`); // Redirect to view page
    } catch (error) {
      console.error('Error saving snippet:', error);
      toast.error(`Failed to save snippet: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading snippet for editing...</div>;
  }

  return (
    <div className={styles.editContainer}>
      <h2>Edit Code Snippet</h2>
      <form onSubmit={handleSave}>
        <div className={styles.formGroup}>
          <label htmlFor="filename-input">Filename:</label>
          <input
            id="filename-input"
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            required
            disabled={saving}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="language-display">Language:</label>
          <input
            id="language-display"
            type="text"
            value={language}
            disabled // Language is not directly editable
            className={styles.disabledInput}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="description-input">Description:</label>
          <textarea
            id="description-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the code"
            rows="3"
            disabled={saving}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="code-content-input">Code Content:</label>
          <textarea
            id="code-content-input"
            value={codeContent}
            onChange={(e) => setCodeContent(e.target.value)}
            rows="20"
            required
            disabled={saving}
            className={styles.codeContentInput}
          />
        </div>
        <button type="submit" disabled={saving} className={styles.saveButton}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button type="button" onClick={() => router.push(`/code-snippets/${snippetId}`)} disabled={saving} className={styles.cancelButton}>
          Cancel
        </button>
      </form>
    </div>
  );
}
