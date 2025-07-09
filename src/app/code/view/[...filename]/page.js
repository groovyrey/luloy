'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

function getLanguage(filename) {
    if (!filename) return 'plaintext';
    const extension = filename.split('.').pop();
    switch (extension) {
        case 'js': return 'javascript';
        case 'py': return 'python';
        case 'cpp': return 'cpp';
        case 'cxx': return 'cpp';
        case 'css': return 'css';
        case 'json': return 'json';
        case 'html': return 'html';
        case 'md': return 'markdown';
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
        case 'cpp':
            return 'bi-filetype-cpp';
        case 'svg':
            return 'bi-filetype-svg';
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
                <h1 className="mb-0">{filename}</h1>
            </div>
            <div className="card">
                <div className="card-body p-0">
                    <SyntaxHighlighter language={lang} style={atomDark} showLineNumbers customStyle={{ margin: 0 }} wrapLines={true}>
                        {content}
                    </SyntaxHighlighter>
                </div>
            </div>
            <Link href="/code" className="btn btn-secondary mt-4">
                <i className="bi bi-arrow-left me-2"></i>
                Back to Files
            </Link>
        </div>
    );
}