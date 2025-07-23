import { put, head } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { auth, firestore, admin } from '/lib/firebase-admin.js';

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric characters except spaces and hyphens
    .trim()
    .replace(/\s+/g, '-'); // Replace spaces with hyphens
}

export async function POST(request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  const session = sessionCookie ? sessionCookie.value : '';

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

  const formData = await request.formData();
  const file = formData.get('file');
  const filename = formData.get('filename');
  const title = formData.get('title');
  const description = formData.get('description');
  const language = formData.get('language');
  const type = formData.get('type');

  if (!file || !filename || !type) {
    return NextResponse.json({ error: 'File, filename, and type are required' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = file.type;

  let blobPath;
  let collectionName;
  let metadata = {};

  if (type === 'post') {
    blobPath = `posts/${filename}`;
    collectionName = 'posts';
  } else if (type === 'code') {
    blobPath = `userCodes/${decodedClaims.uid}/${filename}`; // Ensure unique path for user codes
    collectionName = 'codes';
  } else {
    return NextResponse.json({ error: 'Invalid upload type' }, { status: 400 });
  }

  try {
    const userId = decodedClaims.uid; // decodedClaims is already available from session verification
    let docRef;
    let existingDocId = null;

    // Check if a document with the same filename and userId already exists
    const existingDocsSnapshot = await firestore.collection(collectionName)
      .where('filename', '==', filename)
      .where(type === 'post' ? 'uploadedBy' : 'userId', '==', userId)
      .limit(1)
      .get();

    if (existingDocsSnapshot.empty) {
      // No existing document, create a new one
      docRef = firestore.collection(collectionName).doc();
      console.log(`Attempting to save to Firestore collection: ${collectionName}`);
    } else {
      // Existing document found, update it
      existingDocId = existingDocsSnapshot.docs[0].id;
      docRef = firestore.collection(collectionName).doc(existingDocId);
      console.log(`Existing document found. Attempting to update Firestore document with ID: ${existingDocId}`);
    }

    const blob = await put(blobPath, file, {
      access: 'public',
      contentType: contentType,
    });

    if (type === 'post') {
      const slug = generateSlug(title);
      metadata = {
        title: title,
        description: description,
        markdownBlobUrl: blob.url,
        filename: filename,
        fileType: blob.contentType || '',
        size: blob.size || 0,
        uploadedBy: userId,
        uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
        slug: slug, // Add the generated slug
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

    console.log('Metadata to save/update:', JSON.stringify(metadata, null, 2));
    await docRef.set(metadata, { merge: true }); // Use merge: true to update existing fields
    console.log(`Successfully saved/updated to Firestore with ID: ${docRef.id}`);

    // Revalidate the /learn path if a new post was added
    if (type === 'post') {
      revalidatePath('/learn');
    }

    return NextResponse.json({ ...blob, firestoreDocId: docRef.id });
  } catch (error) {
    console.error('Error uploading blob or saving to Firestore:', error);
    return NextResponse.json({ error: 'Failed to upload file or save metadata', details: error.message, stack: error.stack }, { status: 500 });
  }
}
