'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useUser } from '../../../context/UserContext';
import LoadingMessage from '../../../components/LoadingMessage';
import styles from './EditCodeSnippet.module.css';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-typescript';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-markdown';
import 'ace-builds/src-noconflict/mode-ruby';
import 'ace-builds/src-noconflict/mode-php';
import 'ace-builds/src-noconflict/mode-golang';
import 'ace-builds/src-noconflict/mode-swift';
import 'ace-builds/src-noconflict/mode-kotlin';
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/mode-sh';


import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-github';


export default function EditCodeSnippetPage() {
  const params = useParams();
  const router = useRouter();
  const { snippetId } = params;
  const { user } = useUser();

  const [snippetData, setSnippetData] = useState(null);
  const [filename, setFilename] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (snippetId) {
      const fetchSnippet = async () => {
        try {
          const res = await fetch(`/api/code-snippets/${snippetId}`);
          if (!res.ok) {
            throw new Error('Failed to fetch snippet data');
          }
          const data = await res.json();
          setSnippetData(data);
          setFilename(data.filename);
          setDescription(data.description);

          if (!user || user.uid !== data.userId) {
            toast.error('You are not authorized to edit this snippet.');
            router.push(`/code-snippets/${snippetId}`);
            return;
          }

          if (data.codeBlobUrl) {
            const codeRes = await fetch(data.codeBlobUrl);
            if (!codeRes.ok) {
              throw new Error('Failed to fetch code content');
            }
            const content = await codeRes.text();
            setCode(content);
          }

        } catch (err) {
          console.error('Error fetching snippet:', err);
          toast.error(err.message || 'Failed to load snippet data.');
          router.push('/user/my-snippets');
        } finally {
          setLoading(false);
        }
      };
      fetchSnippet();
    }
  }, [snippetId, user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
        // Create a blob from the code content
        const blob = new Blob([code], { type: 'text/plain' });
        const file = new File([blob], filename, { type: 'text/plain' });

        // Upload the new file to Vercel Blob
        const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filename: `userCodes/${user.uid}/${filename}`,
                contentType: file.type,
            }),
        });

        if (!uploadResponse.ok) {
            throw new Error('Failed to get upload URL.');
        }

        const { url, downloadUrl } = await uploadResponse.json();

        const uploadResult = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': file.type,
            },
            body: file,
        });

        if (!uploadResult.ok) {
            throw new Error('Failed to upload code to blob storage.');
        }


      const res = await fetch(`/api/code-snippets/${snippetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename,
          description,
          codeBlobUrl: downloadUrl,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update snippet');
      }

      toast.success('Snippet updated successfully!');
      router.push(`/code-snippets/${snippetId}`);
    } catch (err) {
      console.error('Error updating snippet:', err);
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingMessage />;
  }

  if (!snippetData) {
    return <div className="text-center mt-5">Snippet not found.</div>;
  }

  return (
    <div className={styles.editContainer}>
      <h2 className={styles.title}>Edit Snippet</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className="mb-3">
          <label htmlFor="filename" className="form-label">Filename</label>
          <input
            type="text"
            id="filename"
            className="form-control"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="language" className="form-label">Language</label>
          <input
            type="text"
            id="language"
            className="form-control"
            value={snippetData.language || ''}
            disabled
          />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            id="description"
            className="form-control"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>
        <div className="mb-3">
            <label htmlFor="code" className="form-label">Code</label>
            <AceEditor
                mode={snippetData.language?.toLowerCase() || 'javascript'}
                theme="monokai"
                onChange={setCode}
                name="code-editor"
                editorProps={{ $blockScrolling: true }}
                value={code}
                width="100%"
                height="400px"
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
                }}
            />
        </div>
        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
