import { firestore, auth } from '/lib/firebase-admin';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function DELETE(request, { params }) {
  const session = cookies().get('session')?.value || '';

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: No session found' }, { status: 401 });
  }

  let decodedClaims;
  try {
    decodedClaims = await auth.verifySessionCookie(session, true);
  } catch (error) {
    console.error('Error verifying session cookie for post delete:', error);
    return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
  }

  const userId = decodedClaims.uid;

  // Check if the user has the 'staff' badge
  try {
    const userDoc = await firestore.collection('users').doc(userId).get();
    if (!userDoc.exists || !userDoc.data().badges || !userDoc.data().badges.includes('staff')) {
      return NextResponse.json({ error: 'Forbidden: Only staff members can delete posts' }, { status: 403 });
    }
  } catch (error) {
    console.error('Error checking user badges:', error);
    return NextResponse.json({ error: 'Forbidden: Could not verify user permissions' }, { status: 403 });
  }

  const { slug } = params;

  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
  }

  try {
    const postRef = firestore.collection('posts').where('slug', '==', slug);
    const snapshot = await postRef.get();

    if (snapshot.empty) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const docId = snapshot.docs[0].id;
    await firestore.collection('posts').doc(docId).delete();

    // Revalidate the /learn path to clear Next.js cache
    revalidatePath('/learn');

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post', details: error.message }, { status: 500 });
  }
}
