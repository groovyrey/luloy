'use client';

import { useState, useEffect, use } from 'react';
import { showToast } from '../../../utils/toast';
import Link from 'next/link';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from './CodeViewer.module.css';

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

function getFileIcon(filename) {
    if (!filename) return 'bi-file-earmark';
    const extension = filename.split('.').pop();
    switch (extension) {
        case 'js':
            return 'bi-filetype-js';
        case 'py':
            return 'bi-filetype-py';
        case 'html':
            return 'bi-filetype-html';
        case 'css':
            return 'bi-filetype-css';
        case 'json':
            return 'bi-filetype-json';
        case 'md':
            return 'bi-filetype-md';
        case 'svg':
            return 'bi-filetype-svg';
        case 'java':
            return 'bi-filetype-java';
        case 'ts':
            return 'bi-filetype-typescript';
        case 'tsx':
            return 'bi-filetype-tsx';
        case 'jsx':
            return 'bi-filetype-jsx';
        case 'xml':
            return 'bi-filetype-xml';
        case 'yml':
        case 'yaml':
            return 'bi-filetype-yml';
        case 'php':
            return 'bi-filetype-php';
        case 'rb':
            return 'bi-filetype-ruby';
        case 'go':
            return 'bi-filetype-go';
        case 'swift':
            return 'bi-filetype-swift';
        case 'kt':
            return 'bi-filetype-kotlin';
        case 'c':
            return 'bi-filetype-c';
        case 'h':
            return 'bi-filetype-h';
        case 'hpp':
            return 'bi-filetype-hpp';
        case 'cs':
            return 'bi-filetype-cs';
        case 'sh':
        case 'bat':
        case 'cmd':
            return 'bi-filetype-exe';
        case 'sql':
            return 'bi-filetype-sql';
        case 'txt':
        case 'log':
            return 'bi-file-earmark-text';
        case 'zip':
        case 'rar':
        case '7z':
            return 'bi-file-earmark-zip';
        case 'pdf':
            return 'bi-filetype-pdf';
        case 'doc':
        case 'docx':
            return 'bi-filetype-word';
        case 'xls':
        case 'xlsx':
            return 'bi-filetype-excel';
        case 'ppt':
        case 'pptx':
            return 'bi-filetype-ppt';
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'bmp':
        case 'webp':
            return 'bi-file-earmark-image';
        default:
            return 'bi-file-earmark';
    }
}

export default function CodeViewer({ params }) {
    const { filename: rawFilename } = use(params);
    const filename = rawFilename.map(segment => decodeURIComponent(segment)).join('/');

    const [content, setContent] = useState('');
    const [error, setError] = useState(null);
    const [lang, setLang] = useState('plaintext');
    const [loading, setLoading] = useState(true); // Add loading state
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        showToast('Code copied to clipboard!', 'success');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    useEffect(() => {
        if (!filename) return;

        async function fetchFileContent() {
            try {
                const res = await fetch(`/code/${filename}`);
                if (!res.ok) {
                    throw new Error(`File not found: ${filename}`);
                }
                const text = await res.text();
                setContent(text);
                setLang(getLanguage(filename));
            } catch (err) {
                setError(err.message);
            } finally { // Ensure loading is set to false
                setLoading(false);
            }
        }

        fetchFileContent();
    }, [filename]);

    if (error) {
        return <div className="container mt-5"><p className="text-danger">{error}</p></div>;
    }

    return (
        <div className="container mt-5">
            <div className="d-flex align-items-center mb-4">
                <i className={`bi ${getFileIcon(filename)} me-3 fs-2`}></i>
                <h1 className={`${styles.filename} mb-0`}>{filename}</h1>
            </div>
            {loading && content === '' ? (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <div className="card position-relative">
                    <button className="btn btn-secondary btn-sm position-absolute top-0 end-0 mt-2 me-2" onClick={handleCopy} style={{ zIndex: 1, '--bs-btn-hover-bg': 'var(--bs-secondary)', '--bs-btn-hover-border-color': 'var(--bs-secondary)' }}>
                        {copied ? <><i className="bi bi-check me-1"></i>Copied!</> : <><i className="bi bi-clipboard me-1"></i>Copy Code</>}
                    </button>
                    <div className="card-body p-0">
                        <SyntaxHighlighter language={lang} style={dracula} showLineNumbers customStyle={{ margin: '40px 0 0 0' }} wrapLines={true} wrapLongLines={true}>
                            {content}
                        </SyntaxHighlighter>
                    </div>
                </div>
            )}
            <Link href="/code" className="btn btn-secondary mt-4">
                <i className="bi bi-arrow-left me-2"></i>
                Back to Files
            </Link>
        </div>
    );
}