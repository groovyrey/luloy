import { NextResponse } from 'next/server';
import { auth, firestore } from '../../../../../lib/firebase-admin';

export async function POST(request) {
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authorization.split('Bearer ')[1];
    let decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userDoc = await firestore.collection('users').doc(uid).get();
    const userAuthLevel = userDoc.exists ? userDoc.data().authLevel || 0 : 0;

    if (userAuthLevel !== 1) {
      return NextResponse.json({ message: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }

    let messageId, isPrivate;
    try {
      ({ messageId, private: isPrivate } = await request.json());
    } catch (error) {
      console.error("Error parsing JSON for message visibility update:", error);
      return NextResponse.json({ message: 'Invalid JSON in request body.' }, { status: 400 });
    }

    if (!messageId || typeof messageId !== 'string' || messageId.trim().length === 0) {
      console.error("Validation Error: Invalid or missing messageId for message visibility update.");
      return NextResponse.json({ message: 'Bad Request: Message ID is required and must be a non-empty string.' }, { status: 400 });
    }

    if (typeof isPrivate !== 'boolean') {
      console.error(`Validation Error for messageId ${messageId}: Invalid 'private' status provided: ${isPrivate}`);
      return NextResponse.json({ message: "Bad Request: 'private' status must be a boolean." }, { status: 400 });
    }

    const messageRef = firestore.collection('maindata').doc(messageId);
    const messageDoc = await messageRef.get();

    if (!messageDoc.exists) {
      return NextResponse.json({ message: 'Not Found: Message not found' }, { status: 404 });
    }

    await messageRef.update({ private: isPrivate });

    return NextResponse.json({ message: 'Message visibility updated successfully' });

  } catch (error) {
    console.error('Error updating message visibility:', error.message, error.stack);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
