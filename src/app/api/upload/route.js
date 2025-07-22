import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { auth } from '/lib/firebase-admin.js';

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

  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }

  try {
    const blob = await put(filename, request.body, {
      access: 'public', // or 'private' if you want to generate signed URLs
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error('Error uploading blob:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
