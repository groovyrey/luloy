'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { showToast } from '../../../utils/toast';
import Link from 'next/link';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from './CodeViewer.module.css';
import MotionDiv from '../../../components/MotionDiv';
import LoadingMessage from '../../../components/LoadingMessage';
import { useUser } from '../../../context/UserContext';
import AuthorEditor from '../../../components/AuthorEditor';
import FileIcon from '../../../components/FileIcon';

function getLanguage(filename) {
    if (!filename) return 'plaintext';
    const extension = filename.split('.').pop();
    switch (extension) {
        case 'js': return 'javascript';
        case 'jsx': return 'jsx';
        case 'ts': return 'typescript';
        case 'tsx': return 'tsx';
        case 'py': return 'python';
        case 'java': return 'java';
        case 'c': return 'c';
        case 'cpp': return 'cpp';
        case 'cxx': return 'cpp';
        case 'cs': return 'csharp';
        case 'go': return 'go';
        case 'php': return 'php';
        case 'rb': return 'ruby';
        case 'swift': return 'swift';
        case 'kt': return 'kotlin';
        case 'rs': return 'rust';
        case 'scala': return 'scala';
        case 'pl': return 'perl';
        case 'sh': return 'bash';
        case 'bat': return 'batch';
        case 'ps1': return 'powershell';
        case 'sql': return 'sql';
        case 'html': return 'html';
        case 'css': return 'css';
        case 'scss': return 'scss';
        case 'less': return 'less';
        case 'json': return 'json';
        case 'yaml': return 'yaml';
        case 'yml': return 'yaml';
        case 'xml': return 'xml';
        case 'md': return 'markdown';
        case 'r': return 'r';
        case 'dockerfile': return 'dockerfile';
        default: return 'plaintext';
    }
}



export default function CodeViewer({ params }) {
    const { filename: rawFilename } = use(params);
    const filename = rawFilename.map(segment => decodeURIComponent(segment)).join('/');

    const [content, setContent] = useState('');
    const [author, setAuthor] = useState('Unknown');
    const [authorDetails, setAuthorDetails] = useState(null);
    const [error, setError] = useState(null);
    const [lang, setLang] = useState('plaintext');
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        showToast('Code copied to clipboard!', 'success');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const { user } = useUser();
    const userAuthLevel = user?.authLevel || 0;

    const fetchFileContent = async () => {
        try {
            const res = await fetch(`/api/code/view/${filename}`);
            if (!res.ok) {
                throw new Error(`File not found: ${filename}`);
            }
            const data = await res.json();
            setContent(data.content);
            setLang(getLanguage(filename));
            setAuthor(data.author);
            setAuthorDetails(data.authorDetails);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRenameAuthor = async (newAuthorName) => {
        if (!newAuthorName.trim()) {
            showToast('Author name cannot be empty.', 'error');
            return;
        }

        setIsRenaming(true);
        try {
            const res = await fetch('/api/code/rename-author', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ filename, newAuthorName }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to rename author');
            }

            showToast('Author renamed successfully!', 'success');
            fetchFileContent(); // Re-fetch data to update author details
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setIsRenaming(false);
        }
    };

    useEffect(() => {
        if (!filename) return;
        fetchFileContent();
    }, [filename]);

    

    if (error) {
        return <div className="container mt-5"><p className="text-danger">{error}</p></div>;
    }

    return (
        <section className={`${styles.viewerContainer} container-fluid mt-5`}>
            <div className={`${styles.header} d-flex align-items-center mb-4`}>
                <FileIcon filename={filename} className={`${styles.fileIcon} me-3`} />
                <h1 className={`${styles.filename} mb-0 flex-grow-1`}>{filename}</h1>
            </div>

            {author && (
                <p className="text-muted mb-4">
                    <em>By </em>
                    <AuthorEditor
                        initialAuthor={author}
                        authorDetails={authorDetails}
                        userAuthLevel={userAuthLevel}
                        onRename={handleRenameAuthor}
                        isLoading={isRenaming}
                        loading={loading}
                    />
                </p>
            )}
            {loading && content === '' ? (
                <LoadingMessage />
            ) : (
                <MotionDiv 
                  className={`${styles.codeWrapper} card`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                    <div className="card-header d-flex justify-content-end align-items-center">
                        <button className="btn btn-sm btn-outline-secondary" onClick={handleCopy}>
                            {copied ? <><i className="bi bi-check me-1"></i>Copied!</> : <><i className="bi bi-clipboard me-1"></i>Copy Code</>}
                        </button>
                    </div>
                    <div className="card-body">
                        <SyntaxHighlighter 
                            language={lang} 
                            style={vscDarkPlus} 
                            showLineNumbers 
                            customStyle={{ margin: '0', padding: '1rem', borderRadius: 'var(--border-radius-base)' }} 
                            wrapLines={true} 
                            wrapLongLines={true}
                        >
                            {content}
                        </SyntaxHighlighter>
                    </div>
                </MotionDiv>
            )}
            <Link href="/code" className={`${styles.backButton} btn btn-secondary mt-4`}>
                <i className="bi bi-arrow-left me-2"></i>
                Back to Files
            </Link>
        </section>
    );
}