import { firestore } from '/lib/firebase-admin';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { auth } from '/lib/firebase-admin';
import { del, put } from '@vercel/blob';
import { revalidatePath } from 'next/cache'; // Import revalidatePath

export const revalidate = 0; // Ensure no caching for this API route

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

    const snippetData = docSnap.data();
    return NextResponse.json(snippetData);
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
    console.error('Error verifying session cookie for update:', error);
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

    const { filename, description, codeContent } = await request.json();
    

    const updateData = {
      filename,
      description,
      updatedAt: new Date(),
    };

    if (codeContent !== undefined) {
      const snippetData = docSnap.data();
      const oldBlobUrl = snippetData.codeBlobUrl;

      // Determine file extension based on language, default to .txt
      const fileExtension = snippetData.language ? `.${snippetData.language.toLowerCase()}` : '.txt';
      const blobFilename = `userCodes/${userId}/${snippetId}${fileExtension}`;

      const blob = await put(blobFilename, codeContent, {
        access: 'public',
        allowOverwrite: true,
      });
      
      
      updateData.codeBlobUrl = blob.url;

      // Delete old blob if it exists and is different from the new one
      if (oldBlobUrl && oldBlobUrl !== blob.url) {
        try {
          await del(oldBlobUrl);
          
        } catch (blobError) {
          console.error(`Error deleting old blob ${oldBlobUrl}:`, blobError);
        }
      }
    }

    await docRef.update(updateData);

    // Revalidate paths to ensure fresh data is fetched on subsequent requests
    revalidatePath(`/code-snippets/${snippetId}`);
    revalidatePath(`/user/my-snippets`); // Assuming this path lists user's snippets
    

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

