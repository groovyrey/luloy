import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { auth, firestore, admin } from '/lib/firebase-admin.js';

export async function POST(request) {
  const session = cookies().get('session')?.value || '';

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: No session found' }, { status: 401 });
  }

  let decodedClaims;
  try {
    decodedClaims = await auth.verifySessionCookie(session, true); // Verify session, checkRevoked true
  } catch (error) {
    console.error('Error verifying session cookie for upload:', error);
    return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');
  const type = searchParams.get('type'); // 'post' or 'code'
  const title = searchParams.get('title') || filename;
  const description = searchParams.get('description') || '';
  const language = searchParams.get('language') || 'unknown'; // For code snippets

  if (!filename || !type) {
    return NextResponse.json({ error: 'Filename and type are required' }, { status: 400 });
  }

  let blobPath;
  let collectionName;
  let metadata = {};

  if (type === 'post') {
    blobPath = `posts/${filename}`;
    collectionName = 'posts';
  } else if (type === 'code') {
    blobPath = `userCodes/${filename}`;
    collectionName = 'codes';
  } else {
    return NextResponse.json({ error: 'Invalid upload type' }, { status: 400 });
  }

  try {
    const blob = await put(blobPath, request.body, {
      access: 'public',
    });

    const userId = decodedClaims.uid; // decodedClaims is already available from session verification

    if (type === 'post') {
      metadata = {
        title: title,
        description: description,
        markdownBlobUrl: blob.url,
        filename: filename,
        fileType: blob.contentType,
        size: blob.size,
        uploadedBy: userId,
        uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
    } else if (type === 'code') {
      metadata = {
        userId: userId,
        filename: filename,
        language: language,
        description: description,
        codeBlobUrl: blob.url,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
    }

    const docRef = firestore.collection(collectionName).doc();
    await docRef.set(metadata);

    return NextResponse.json({ ...blob, firestoreDocId: docRef.id });
  } catch (error) {
    console.error('Error uploading blob or saving to Firestore:', error);
    return NextResponse.json({ error: 'Failed to upload file or save metadata', details: error.message }, { status: 500 });
  }
}
