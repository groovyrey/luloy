import { firestore } from '/lib/firebase-admin';
import { cookies } from 'next/headers';
import { auth } from '/lib/firebase-admin';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const session = cookies().get('session')?.value || '';

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: No session found' }, { status: 401 });
  }

  let decodedClaims;
  try {
    decodedClaims = await auth.verifySessionCookie(session, true); // Verify session, checkRevoked true
  } catch (error) {
    console.error('Error verifying session cookie for code snippet upload:', error);
    return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
  }

  const userId = decodedClaims.uid;

  try {
    const { filename, language, description, codeBlobUrl } = await request.json();

    if (!filename || !codeBlobUrl) {
      return NextResponse.json({ error: 'Filename and codeBlobUrl are required' }, { status: 400 });
    }

    const newSnippetRef = firestore.collection('codes').doc(); // Auto-generate ID
    const snippetId = newSnippetRef.id;

    await newSnippetRef.set({
      snippetId,
      userId,
      filename,
      language: language || 'unknown',
      description: description || '',
      codeBlobUrl,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ message: 'Code snippet metadata saved successfully', snippetId });
  } catch (error) {
    console.error('Error saving code snippet metadata:', error);
    return NextResponse.json({ error: 'Failed to save code snippet metadata' }, { status: 500 });
  }
}
