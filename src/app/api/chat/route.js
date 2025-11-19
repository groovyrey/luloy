
import { NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

const db = admin.firestore();

export async function POST(request) {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decodedToken = await admin.auth().verifySessionCookie(sessionCookie, true);
    const senderId = decodedToken.uid;
    const senderName = decodedToken.name || 'Anonymous';

    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    await db.collection('public-chat').add({
      senderId,
      senderName,
      message,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ message: 'Message sent successfully' }, { status: 201 });

  } catch (error) {
    console.error('Failed to send public chat message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit')) || 5;
  const cursor = searchParams.get('cursor');

  try {
    let query = db.collection('public-chat')
      .orderBy('createdAt', 'desc')
      .limit(limit);

    if (cursor) {
      const cursorSnapshot = await db.collection('public-chat').doc(cursor).get();
      if (cursorSnapshot.exists) {
        query = query.startAfter(cursorSnapshot);
      }
    }

    const snapshot = await query.get();
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];
    const nextCursor = lastVisible ? lastVisible.id : null;

    return NextResponse.json({
      messages,
      nextCursor,
      hasMore: messages.length === limit,
    });

  } catch (error) {
    console.error('Failed to fetch public chat messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
