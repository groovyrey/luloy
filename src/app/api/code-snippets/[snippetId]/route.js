import { firestore } from '/lib/firebase-admin';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { auth } from '/lib/firebase-admin';
import { del } from '@vercel/blob';

export async function GET(request, context) {
  const { snippetId } = await context.params;

  if (!snippetId) {
    return NextResponse.json({ error: 'Snippet ID is required' }, { status: 400 });
  }

  try {
    const docRef = firestore.collection('codes').doc(snippetId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Snippet not found' }, { status: 404 });
    }

    return NextResponse.json(docSnap.data());
  } catch (error) {
    console.error('Error fetching code snippet:', error);
    return NextResponse.json({ error: 'Failed to fetch code snippet' }, { status: 500 });
  }
}

export async function PUT(request, context) {
  const { snippetId } = await context.params;
  const session = (await cookies()).get('session')?.value || '';

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: No session found' }, { status: 401 });
  }

  let decodedClaims;
  try {
    decodedClaims = await auth.verifySessionCookie(session, true);
  } catch (error) {
    console.error('Error verifying session cookie for PUT:', error);
    return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
  }

  const userId = decodedClaims.uid;

  if (!snippetId) {
    return NextResponse.json({ error: 'Snippet ID is required' }, { status: 400 });
  }

  try {
    const docRef = firestore.collection('codes').doc(snippetId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Snippet not found' }, { status: 404 });
    }

    if (docSnap.data().userId !== userId) {
      return NextResponse.json({ error: 'Forbidden: You do not own this snippet' }, { status: 403 });
    }

    const { filename, description, codeBlobUrl } = await request.json();

    const updateData = {};
    if (filename !== undefined) updateData.filename = filename;
    if (description !== undefined) updateData.description = description;
    if (codeBlobUrl !== undefined) updateData.codeBlobUrl = codeBlobUrl;

    await docRef.update(updateData);

    return NextResponse.json({ message: 'Snippet updated successfully' });
  } catch (error) {
    console.error('Error updating code snippet:', error);
    return NextResponse.json({ error: 'Failed to update code snippet' }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  const { snippetId } = await context.params;
  const session = (await cookies()).get('session')?.value || '';

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: No session found' }, { status: 401 });
  }

  let decodedClaims;
  try {
    decodedClaims = await auth.verifySessionCookie(session, true);
  } catch (error) {
    console.error('Error verifying session cookie for delete:', error);
    return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
  }

  const userId = decodedClaims.uid;

  if (!snippetId) {
    return NextResponse.json({ error: 'Snippet ID is required' }, { status: 400 });
  }

  try {
    const docRef = firestore.collection('codes').doc(snippetId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Snippet not found' }, { status: 404 });
    }

    if (docSnap.data().userId !== userId) {
      return NextResponse.json({ error: 'Forbidden: You do not own this snippet' }, { status: 403 });
    }

    const snippetData = docSnap.data();
    const blobUrl = snippetData.codeBlobUrl;

    if (blobUrl) {
      try {
        await del(blobUrl);
        console.log(`Successfully deleted blob: ${blobUrl}`);
      } catch (blobError) {
        console.error(`Error deleting blob ${blobUrl}:`, blobError);
        // Continue with Firestore deletion even if blob deletion fails
      }
    }

    await docRef.delete();
    return NextResponse.json({ message: 'Snippet deleted successfully' });
  } catch (error) {
    console.error('Error deleting code snippet:', error);
    return NextResponse.json({ error: 'Failed to delete code snippet' }, { status: 500 });
  }
}