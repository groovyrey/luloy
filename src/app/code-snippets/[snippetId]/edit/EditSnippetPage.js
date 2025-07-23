"use client";

import React, { useState, useEffect } from 'react';
import AceEditor from 'react-ace';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

import 'ace-builds/src-noconflict/mode-javascript'; // Import the mode for JavaScript
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-markdown';
import 'ace-builds/src-noconflict/mode-xml';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-golang';
import 'ace-builds/src-noconflict/mode-ruby';
import 'ace-builds/src-noconflict/mode-swift';
import 'ace-builds/src-noconflict/mode-kotlin';
import 'ace-builds/src-noconflict/mode-sh'; // For bash
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/mode-yaml';
import 'ace-builds/src-noconflict/theme-dracula'; // Import a theme (e.g., Dracula)
import 'ace-builds/src-noconflict/ext-language_tools'; // Import language tools for features like autocompletion

const EditSnippetPage = ({ initialSnippetData }) => {
    const [code, setCode] = useState(initialSnippetData?.codeContent || '// Start coding here...');
    const [filename, setFilename] = useState(initialSnippetData?.filename || '');
    const [description, setDescription] = useState(initialSnippetData?.description || '');
    const [language, setLanguage] = useState(initialSnippetData?.language || 'javascript');
    const router = useRouter();

    useEffect(() => {
        if (initialSnippetData) {
            setCode(initialSnippetData.codeContent || '');
            setFilename(initialSnippetData.filename || '');
            setDescription(initialSnippetData.description || '');
            setLanguage(initialSnippetData.language || 'javascript');
        }
    }, [initialSnippetData]);

    const onChange = (newValue) => {
        setCode(newValue);
    };

    const handleSave = async () => {
        if (!initialSnippetData?.id) {
            toast.error('Snippet ID is missing. Cannot save.');
            return;
        }

        const updatedSnippet = {
            filename,
            description,
            language,
            code: code,
        };

        try {
            const res = await fetch(`/api/code-snippets/${initialSnippetData.id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedSnippet),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to update snippet');
            }

            toast.success('Snippet updated successfully!');
            router.push(`/code-snippets/${initialSnippetData.id}`);
        } catch (err) {
            console.error('Error updating snippet:', err);
            toast.error(err.message || 'Failed to save changes.');
        }
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Edit Code Snippet</h1>
            <div className="mb-3">
                <label htmlFor="filename" className="form-label">Filename</label>
                <input
                    type="text"
                    className="form-control"
                    id="filename"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                />
            </div>
            <div className="mb-3">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea
                    className="form-control"
                    id="description"
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                ></textarea>
            </div>
            <div className="mb-3">
                <label htmlFor="language" className="form-label">Language</label>
                <input
                    type="text"
                    className="form-control"
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    disabled={true} // Disable the language field
                />
            </div>
            <div className="mb-3">
                <label htmlFor="codeEditor" className="form-label">Code</label>
                <AceEditor
                    mode={language.toLowerCase() || "javascript"}
                    theme="dracula"
                    onChange={onChange}
                    name="CODE_EDITOR"
                    editorProps={{ $blockScrolling: true }}
                    value={code}
                    setOptions={{
                        enableBasicAutocompletion: true,
                        enableLiveAutocompletion: true,
                        enableSnippets: true,
                        showLineNumbers: true,
                        tabSize: 2,
                    }}
                    style={{
                        width: '100%',
                        height: '500px',
                        borderRadius: 'var(--border-radius-base)',
                    }}
                />
            </div>
            <div className="d-flex justify-content-end gap-2">
                <button onClick={() => router.back()} className="btn btn-secondary">Cancel</button>
                <button onClick={handleSave} className="btn btn-primary">Save Changes</button>
            </div>
        </div>
    );
};

export default EditSnippetPage;