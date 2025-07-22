'use client';

import { useEffect, useState } from 'react';
import Modal from '../../../app/components/Modal';
import { useParams, useRouter } from 'next/navigation'; // useRouter for navigation
import { toast } from 'react-hot-toast';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import c from 'react-syntax-highlighter/dist/esm/languages/prism/c';
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';
import php from 'react-syntax-highlighter/dist/esm/languages/prism/php';
import ruby from 'react-syntax-highlighter/dist/esm/languages/prism/ruby';
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go';
import swift from 'react-syntax-highlighter/dist/esm/languages/prism/swift';
import kotlin from 'react-syntax-highlighter/dist/esm/languages/prism/kotlin';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import batch from 'react-syntax-highlighter/dist/esm/languages/prism/batch';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';

import { useTheme } from '../../../app/context/ThemeContext';
import { useUser } from '../../../app/context/UserContext'; // To get current user
import LoadingMessage from '../../../app/components/LoadingMessage';
import Link from 'next/link';
import FileIcon from '../../../app/components/FileIcon';
import styles from './CodeSnippetPage.module.css';

SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('html', markup);
SyntaxHighlighter.registerLanguage('xml', markup);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('c', c);
SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('php', php);
SyntaxHighlighter.registerLanguage('ruby', ruby);
SyntaxHighlighter.registerLanguage('go', go);
SyntaxHighlighter.registerLanguage('swift', swift);
SyntaxHighlighter.registerLanguage('kotlin', kotlin);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('batch', batch);
SyntaxHighlighter.registerLanguage('sql', sql);
SyntaxHighlighter.registerLanguage('yaml', yaml);

export default function CodeSnippetPage() {
  const params = useParams();
  const router = useRouter();
  const { snippetId } = params;
  const [snippetData, setSnippetData] = useState(null);
  const [codeContent, setCodeContent] = useState('');
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const { user } = useUser(); // Get the current logged-in user
  const [uploaderName, setUploaderName] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false); // State for modal visibility

  useEffect(() => {
    if (snippetId) {
      const fetchSnippet = async () => {
        try {
          const res = await fetch(`/api/code-snippets/${snippetId}`);
          if (!res.ok) {
            throw new Error(`Failed to fetch snippet metadata: ${res.status}`);
          }
          const data = await res.json();
          setSnippetData(data);

          // Fetch user data
          const userRes = await fetch(`/api/user/${data.userId}`);
          if (!userRes.ok) {
            throw new Error(`Failed to fetch user data: ${userRes.status}`);
          }
          const userData = await userRes.json();
          setUploaderName(userData.fullName || userData.email); // Fallback to email if full name not available

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
          console.error('Error fetching code snippet or user data:', err);
          toast.error(err.message || 'Failed to load code snippet.');
        } finally {
          setLoading(false);
        }
      };
      fetchSnippet();
    }
  }, [snippetId]);

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    try {
      const res = await fetch(`/api/code-snippets/${snippetId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete snippet');
      }

      toast.success('Snippet deleted successfully!');
      router.push('/user/my-snippets'); // Redirect to a relevant page
    } catch (err) {
      console.error('Error deleting snippet:', err);
      toast.error(err.message);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeContent);
    toast.success('Code copied to clipboard!');
  };

  const handleShareCode = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: snippetData.filename,
          text: snippetData.description || 'Check out this code snippet!',
          url: shareUrl,
        });
        toast.success('Snippet shared successfully!');
      } catch (error) {
        console.error('Error sharing:', error);
        toast.error('Failed to share snippet.');
      }
    } else {
      // Fallback for browsers that do not support the Web Share API
      navigator.clipboard.writeText(shareUrl);
      toast.success('Snippet URL copied to clipboard!');
    }
  };

  if (loading) {
    return <LoadingMessage />;
  }

  if (!snippetData) {
    return <div className="text-center mt-5">Snippet not found.</div>;
  }

  const isOwner = user && user.uid === snippetData.userId;
  const syntaxHighlighterStyle = vscDarkPlus;

  return (
    <div className={styles.snippetContainer}>
      <div className={styles.snippetHeader}>
        <FileIcon filename={snippetData.language} className="me-3" style={{ fontSize: '2.5rem' }} />
        <h2 className={`${styles.cardTitle} text-truncate`}>{snippetData.filename}</h2>
      </div>
      {snippetData.description && (
        <p className={styles.snippetDescription}>{snippetData.description}</p>
      )}
      <div className={styles.snippetMeta}>
        <span className="badge" style={{ color: 'var(--text-color)' }}>Language: <code className={styles.languageCode}>{snippetData.language}</code></span>
        <span className="badge" style={{ color: 'var(--text-color)' }}>
          Uploaded by: <Link href={`/user/${snippetData.userId}`} className="text-primary">
            {uploaderName}
          </Link>
        </span>
        </div>
      {isOwner && (
        <div className={styles.actionsContainer}>
          <h3 className={styles.actionsTitle}>Actions</h3>
          <div className={styles.actionsButtons}>
          <Link href={`/code-snippets/${snippetId}/edit`} className="btn btn-sm btn-primary d-flex align-items-center ms-2">
            <i className="bi bi-pencil me-1"></i> Edit
          </Link>
          <button onClick={handleDelete} className="btn btn-sm btn-danger d-flex align-items-center ms-2">
            <i className="bi bi-trash me-1"></i> Delete
          </button>
          </div>
        </div>
      )}
      <div className={`${styles.codeBlockContainer} ${styles.markdownBody}`}>
        <div className={styles.codeBlockHeader}>
          <div className={styles.codeBlockActions}>
            <button onClick={handleCopyCode} className="btn btn-sm btn-outline-secondary d-flex align-items-center me-2">
              <i className="bi bi-clipboard me-1"></i> Copy Code
            </button>
            <button onClick={handleShareCode} className="btn btn-sm btn-outline-info d-flex align-items-center">
              <i className="bi bi-share me-1"></i> Share
            </button>
          </div>
        </div>
        <SyntaxHighlighter
          language={snippetData.language?.toLowerCase()}
          style={syntaxHighlighterStyle}
          showLineNumbers
          wrapLines
          customStyle={{
            padding: '1em',
            margin: '0',
            borderRadius: 'var(--border-radius-base)',
            fontSize: '0.9em',
          }}
        >
          {codeContent}
        </SyntaxHighlighter>
      </div>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <h3>Confirm Deletion</h3>
        <p>Are you sure you want to delete this snippet? This action cannot be undone.</p>
        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
          <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}