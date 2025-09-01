'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../../context/ThemeContext';
import LoadingMessage from '../../../components/LoadingMessage';

import AceEditor from 'react-ace';

// Import Ace editor modes (languages)
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-php';
import 'ace-builds/src-noconflict/mode-golang'; // Go language
import 'ace-builds/src-noconflict/mode-rust';
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-xml'; // For markup/xml
import 'ace-builds/src-noconflict/mode-text'; // Default for 'txt'

// Import Ace editor themes
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-dracula'; // Dark theme example

export default function EditCodeSnippetPage() {
  const [description, setDescription] = useState('');
  const [filename, setFilename] = useState('');
  const [codeContent, setCodeContent] = useState('');
  const [language, setLanguage] = useState('txt'); // Default to plain text
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state
  const [wordWrapEnabled, setWordWrapEnabled] = useState(false); // Add word wrap state
  
  const { theme } = useTheme();
  const router = useRouter();
  const { snippetId } = useParams();

  useEffect(() => {
    const fetchSnippet = async () => {
      setLoading(true); // Set loading to true before fetching
      if (!snippetId) {
        setLoading(false); // If no snippetId, stop loading
        return;
      }
      try {
        const res = await fetch(`/api/code-snippets/${snippetId}`, { cache: 'no-store' });
        if (!res.ok) {
          const errorText = await res.text(); // Try to get more error info
          throw new Error(`Failed to fetch snippet data: ${res.status} - ${errorText}`);
        }
        const data = await res.json();
        setDescription(data.description || '');
        setFilename(data.filename || '');
        setLanguage(data.language || 'txt');
        if (data.codeBlobUrl) {
          const codeRes = await fetch(`${data.codeBlobUrl}?t=${Date.now()}`);
          if (!codeRes.ok) {
            const errorText = await codeRes.text(); // Try to get more error info
            throw new Error(`Failed to fetch code content: ${codeRes.status} - ${errorText}`);
          }
          const content = await codeRes.text();
          setCodeContent(content);
        } else {
          toast.error('Code content URL not found for this snippet.');
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false); // Set loading to false after fetching (success or error)
      }
    };
    fetchSnippet();
  }, [snippetId]);

  

  

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/code-snippets/${snippetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename, description, codeContent }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update snippet');
      }

      toast.success('Snippet updated successfully!');
      window.location.href = `/code-snippets/${snippetId}`; // Full page reload
    } catch (error) {
      console.error('Update failed:', error);
      toast.error(`Update failed: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const getAceMode = (lang) => {
    switch (lang) {
      case 'javascript':
      case 'js':
        return 'javascript';
      case 'python':
      case 'py':
        return 'python';
      case 'css':
        return 'css';
      case 'json':
        return 'json';
      case 'java':
        return 'java';
      case 'php':
        return 'php';
      case 'go':
        return 'golang';
      case 'rust':
        return 'rust';
      case 'sql':
        return 'sql';
      case 'html':
      case 'markup':
        return 'html';
      case 'xml':
        return 'xml';
      default:
        return 'text'; // Default to plain text
    }
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      {loading ? (
        <LoadingMessage />
      ) : (
        <div className="card" style={{ maxWidth: '600px', width: '100%' }}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h2 className="card-title fw-bold mb-0 fs-3"><span className="bi-pencil"></span>{" "}Edit Code Snippet</h2>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setWordWrapEnabled(!wordWrapEnabled)}
            title={wordWrapEnabled ? 'Disable Word Wrap' : 'Enable Word Wrap'}
          >
            <i className={`bi ${wordWrapEnabled ? 'bi-text-wrap' : 'bi-text-left'}`}></i>
          </button>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label htmlFor="filename-input" className="form-label"><i className="bi-file-earmark-text me-2"></i>Filename:</label>
            <input
              id="filename-input"
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="form-control"
              disabled={updating}
            />
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
              disabled={updating}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="code-content-input" className="form-label"><i className="bi-code-slash me-2"></i>Code Content:</label>
            <AceEditor
              mode={getAceMode(language)}
              theme={theme === 'dark' ? 'dracula' : 'github'}
              onChange={(newValue) => {
                console.log('DEBUG: AceEditor onChange - newValue:', newValue.substring(0, 100)); // Log first 100 chars
                setCodeContent(newValue);
              }}
              name="code-editor"
              editorProps={{ $blockScrolling: true }}
              value={codeContent}
              fontSize={14}
              showPrintMargin={true}
              showGutter={true}
              highlightActiveLine={true}
              setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: true,
                showLineNumbers: true,
                tabSize: 2,
                wrap: wordWrapEnabled, // Apply word wrap based on state
              }}
              style={{ width: '100%', minHeight: '300px', borderRadius: 'var(--border-radius-base)', border: '1px solid #ced4da' }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            onClick={async () => {
              console.log('DEBUG: handleUpdate - codeContent being sent:', codeContent.substring(0, 100)); // Log first 100 chars
              await handleUpdate();
            }}
            disabled={updating}
          >
            {updating ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              <i className="bi-check-lg"></i>
            )}{' '}{updating ? 'Updating...' : 'Update Snippet'}
          </button>
        </div>
      </div>
      )}
    </div>
  );
}