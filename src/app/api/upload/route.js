import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { auth, firestore, admin } from '/lib/firebase-admin.js';

export async function POST(request) {
  const session = cookies().get('session')?.value || '';

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: No session found' }, { status: 401 });
  }

  try {
    await auth.verifySessionCookie(session, true); // Verify session, checkRevoked true
  } catch (error) {
    console.error('Error verifying session cookie for upload:', error);
    return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');
  const title = searchParams.get('title') || filename; // Use filename as title if not provided
  const description = searchParams.get('description') || '';

  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }

  try {
    const blob = await put(filename, request.body, {
      access: 'public', // or 'private' if you want to generate signed URLs
    });

    // Get user ID from verified session
    const decodedClaims = await auth.verifySessionCookie(session, true);
    const userId = decodedClaims.uid;

    // Save metadata to Firestore
    const postRef = firestore.collection('posts').doc(); // Auto-generate ID
    await postRef.set({
      title: filename, // Use filename as title for now, can be updated later
      markdownBlobUrl: blob.url,
      filename: filename,
      fileType: blob.contentType,
      size: blob.size,
      uploadedBy: userId,
      uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
      // Add other relevant metadata as needed, e.g., description, tags
    });

    return NextResponse.json({ ...blob, firestoreDocId: postRef.id });
  } catch (error) {
    console.error('Error uploading blob:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
