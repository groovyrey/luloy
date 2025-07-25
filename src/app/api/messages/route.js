
import { NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

export async function POST(request) {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized: No session found' }, { status: 401 });
  }

  try {
    const decodedToken = await admin.auth().verifySessionCookie(sessionCookie, true);
    const senderId = decodedToken.uid;

    const { recipientId, message } = await request.json();

    if (!recipientId || !message) {
      return NextResponse.json({ error: 'Recipient ID and message are required' }, { status: 400 });
    }

    // Save the message to Firestore
    const messageRef = await admin.firestore().collection('messages').add({
      senderId,
      recipientId,
      message,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
    });

    // Create a notification for the recipient
    const notificationRef = await admin.firestore().collection('notifications').add({
      userId: recipientId,
      type: 'new_message',
      message: `You have a new message from ${decodedToken.name}`,
      link: `/guestbook/${messageRef.id}`,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ message: 'Message sent successfully', messageId: messageRef.id }, { status: 201 });

  } catch (error) {
    console.error('Failed to send message:', error);
    if (error.code === 'auth/session-cookie-expired' || error.code === 'auth/session-cookie-revoked') {
      return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
