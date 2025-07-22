import { firestore } from '/lib/firebase-admin';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { auth } from '/lib/firebase-admin';
import { del } from '@vercel/blob';

// GET method to fetch a single code snippet by ID
export async function GET(request, { params }) {
  const resolvedParams = await params;
  const { snippetId } = resolvedParams;

  if (!snippetId) {
    return NextResponse.json({ error: 'Snippet ID is required' }, { status: 400 });
  }

  try {
    const snippetDoc = await firestore.collection('codes').doc(snippetId).get();

    if (!snippetDoc.exists) {
      return NextResponse.json({ error: 'Snippet not found' }, { status: 404 });
    }

    return NextResponse.json({ id: snippetDoc.id, ...snippetDoc.data() });
  } catch (error) {
    console.error('Error fetching snippet:', error);
    return NextResponse.json({ error: 'Failed to fetch snippet' }, { status: 500 });
  }
}

// PUT method to update a code snippet by ID
export async function PUT(request, { params }) {
  const resolvedParams = await params;
  const { snippetId } = resolvedParams;

  if (!snippetId) {
    return NextResponse.json({ error: 'Snippet ID is required' }, { status: 400 });
  }

  const session = cookies().get('session')?.value || '';

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: No session found' }, { status: 401 });
  }

  let decodedClaims;
  try {
    decodedClaims = await auth.verifySessionCookie(session, true);
  } catch (error) {
    console.error('Error verifying session cookie for snippet update:', error);
    return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
  }

  try {
    const snippetRef = firestore.collection('codes').doc(snippetId);
    const snippetDoc = await snippetRef.get();

    if (!snippetDoc.exists) {
      return NextResponse.json({ error: 'Snippet not found' }, { status: 404 });
    }

    const snippetData = snippetDoc.data();

    // Ensure only the owner can update the snippet
    if (snippetData.userId !== decodedClaims.uid) {
      return NextResponse.json({ error: 'Forbidden: You do not own this snippet' }, { status: 403 });
    }

    const { filename, description, codeBlobUrl } = await request.json();

    const updateFields = {};
    if (filename !== undefined) updateFields.filename = filename;
    if (description !== undefined) updateFields.description = description;

    if (codeBlobUrl) {
      // If a new blob URL is provided, delete the old one and update the field
      if (snippetData.codeBlobUrl) {
        try {
          await del(snippetData.codeBlobUrl);
        } catch (blobError) {
          console.warn(`Failed to delete old blob for snippet ${snippetId}:`, blobError);
          // Continue with update even if old blob deletion fails
        }
      }
      updateFields.codeBlobUrl = codeBlobUrl;
    }

    await snippetRef.update(updateFields);

    return NextResponse.json({ message: 'Snippet updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating snippet:', error);
    return NextResponse.json({ error: 'Failed to update snippet' }, { status: 500 });
  }
}

// DELETE method to delete a code snippet by ID
export async function DELETE(request, { params }) {
  const resolvedParams = await params;
  const { snippetId } = resolvedParams;

  if (!snippetId) {
    return NextResponse.json({ error: 'Snippet ID is required' }, { status: 400 });
  }

  const session = cookies().get('session')?.value || '';

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: No session found' }, { status: 401 });
  }

  let decodedClaims;
  try {
    decodedClaims = await auth.verifySessionCookie(session, true);
  } catch (error) {
    console.error('Error verifying session cookie for snippet deletion:', error);
    return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
  }

  try {
    const snippetRef = firestore.collection('codes').doc(snippetId);
    const snippetDoc = await snippetRef.get();

    if (!snippetDoc.exists) {
      return NextResponse.json({ error: 'Snippet not found' }, { status: 404 });
    }

    const snippetData = snippetDoc.data();

    // Ensure only the owner can delete the snippet
    if (snippetData.userId !== decodedClaims.uid) {
      return NextResponse.json({ error: 'Forbidden: You do not own this snippet' }, { status: 403 });
    }

    // Delete from Vercel Blob
    if (snippetData.codeBlobUrl) {
      try {
        await del(snippetData.codeBlobUrl);
      } catch (blobError) {
        console.warn(`Failed to delete blob for snippet ${snippetId}:`, blobError);
        // Continue to delete Firestore record even if blob deletion fails
      }
    }

    // Delete from Firestore
    await snippetRef.delete();

    return NextResponse.json({ message: 'Snippet deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting snippet:', error);
    return NextResponse.json({ error: 'Failed to delete snippet' }, { status: 500 });
  }
}