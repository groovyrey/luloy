'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { capitalizeName } from '../utils/capitalizeName';

export default function AuthorEditor({ initialAuthor, authorDetails, userAuthLevel, onRename, isLoading, loading }) {
    const [isEditing, setIsEditing] = useState(false);
    const [authorName, setAuthorName] = useState(initialAuthor);

    useEffect(() => {
        setAuthorName(initialAuthor);
    }, [initialAuthor]);

    const handleSave = () => {
        onRename(authorName);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setAuthorName(initialAuthor);
        setIsEditing(false);
    };

    if (loading) {
        return <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>;
    }

    if (loading) {
        return <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>;
    }

    if (loading) {
        return <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>;
    }

    if (loading) {
        return <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>;
    }

    if (loading) {
        return <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>;
    }

    if (loading) {
        return <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>;
    }

    if (loading) {
        return <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>;
    }

    if (loading) {
        return <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>;
    }

    if (isEditing) {
        return (
            <div className="input-group d-inline-flex w-auto">
                <input
                    type="text"
                    className="form-control form-control-sm"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    autoFocus
                />
                <button className="btn btn-sm btn-primary" onClick={handleSave} disabled={isLoading}>
                    {isLoading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : 'Save'}
                </button>
                <button className="btn btn-sm btn-secondary" onClick={handleCancel} disabled={isLoading}>Cancel</button>
            </div>
        );
    }

    return (
        <>
            {authorDetails ? (
                <Link href={`/user/${authorDetails.uid}`} className="text-decoration-underline">
                    {capitalizeName(authorDetails.firstName)} {capitalizeName(authorDetails.lastName)}
                </Link>
            ) : (
                initialAuthor
            )}
            {userAuthLevel >= 1 && (
                <button className="btn btn-sm btn-outline-secondary ms-2" onClick={() => setIsEditing(true)}>
                    Rename Author
                </button>
            )}
        </>
    );
}
