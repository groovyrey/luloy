'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../../../app/context/ThemeContext';
import LoadingMessage from '../../../app/components/LoadingMessage';
import Link from 'next/link';

export default function CodeSnippetPage({ params }) {
  const { snippetId } = params;
  const [snippetData, setSnippetData] = useState(null);
  const [codeContent, setCodeContent] = useState('');
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    if (snippetId) {
      const fetchSnippet = async () => {
        try {
          // Fetch snippet metadata from API route
          const res = await fetch(`/api/code-snippets/${snippetId}`);
          if (!res.ok) {
            throw new Error(`Failed to fetch snippet metadata: ${res.status}`);
          }
          const data = await res.json();
          setSnippetData(data);

          // Fetch code content from Vercel Blob URL
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
          console.error('Error fetching code snippet:', err);
          toast.error(err.message || 'Failed to load code snippet.');
        } finally {
          setLoading(false);
        }
      };
      fetchSnippet();
    }
  }, [snippetId]);

  if (loading) {
    return <LoadingMessage />;
  }

  if (!snippetData) {
    return <div className="text-center mt-5">Snippet not found.</div>;
  }

  const syntaxHighlighterStyle = theme === 'dark' ? vscDarkPlus : vs;

  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="card" style={{ maxWidth: '800px', width: '100%', margin: '20px auto' }}>
        <div className="card-body">
          <h2 className="card-title text-center mb-3">{snippetData.filename}</h2>
          {snippetData.description && (
            <p className="text-muted text-center mb-3">{snippetData.description}</p>
          )}
          <div className="mb-3 text-center">
            <span className="badge bg-primary me-2">Language: {snippetData.language}</span>
            <Link href={`/user/${snippetData.userId}`} className="badge bg-secondary">
              Uploaded by: {snippetData.userId} {/* This should ideally be username */}
            </Link>
          </div>
          <div style={{ overflowX: 'auto', borderRadius: 'var(--border-radius-base)' }}>
            <SyntaxHighlighter
              language={snippetData.language}
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
        </div>
      </div>
    </div>
  );
}
