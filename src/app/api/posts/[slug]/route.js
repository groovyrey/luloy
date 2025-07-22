import { firestore, auth } from '/lib/firebase-admin';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { del } from '@vercel/blob';

export async function DELETE(request, { params }) {
  const cookieStore = await cookies(); // Await the cookies() function
  console.log('DEBUG: cookieStore (after await): ', cookieStore); // Log the awaited cookie store
  const session = cookieStore.get('session')?.value || '';
  console.log('DEBUG: session value from cookieStore:', session); // Log the session value

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
    const postData = snapshot.docs[0].data();
    const blobUrl = postData.blobUrl;

    if (blobUrl) {
      try {
        await del(blobUrl);
        console.log(`Successfully deleted blob: ${blobUrl}`);
      } catch (blobError) {
        console.error(`Error deleting blob ${blobUrl}:`, blobError);
        // Continue with Firestore deletion even if blob deletion fails
      }
    }

    await firestore.collection('posts').doc(docId).delete();

    // Revalidate the /learn path to clear Next.js cache
    revalidatePath('/learn');

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post', details: error.message }, { status: 500 });
  }
}
