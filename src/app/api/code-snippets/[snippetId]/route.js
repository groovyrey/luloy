import { firestore } from '/lib/firebase-admin';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { auth } from '/lib/firebase-admin';

export async function GET(request, { params }) {
  const { snippetId } = params;

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

export async function DELETE(request, { params }) {
  const session = cookies().get('session')?.value || '';

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

  const { snippetId } = params;
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

    await docRef.delete();
    return NextResponse.json({ message: 'Snippet deleted successfully' });
  } catch (error) {
    console.error('Error deleting code snippet:', error);
    return NextResponse.json({ error: 'Failed to delete code snippet' }, { status: 500 });
  }
}
