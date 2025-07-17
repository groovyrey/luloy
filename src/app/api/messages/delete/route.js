import { admin, auth, firestore } from '/lib/firebase-admin';

export async function POST(req) {
  try {
    let messageId;
    try {
      ({ messageId } = await req.json());
    } catch (error) {
      console.error("Error parsing JSON for message deletion:", error);
      return new Response(JSON.stringify({ message: 'Invalid JSON in request body.' }), { status: 400 });
    }
    const idToken = req.headers.get('Authorization')?.split('Bearer ')[1];

    if (!idToken) {
      console.warn("Unauthorized attempt to delete message: No ID token provided.");
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    if (!messageId || typeof messageId !== 'string' || messageId.trim().length === 0) {
      console.error("Validation Error: Invalid or missing messageId for message deletion.");
      return new Response(JSON.stringify({ message: 'Bad Request: Message ID is required.' }), { status: 400 });
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userDoc = await firestore.collection('users').doc(uid).get();
    const userAuthLevel = userDoc.exists ? userDoc.data().authLevel || 0 : 0;

    if (userAuthLevel !== 1) {
      return new Response(JSON.stringify({ message: 'Forbidden: Insufficient authorization' }), { status: 403 });
    }

    const db = admin.firestore();
    const messageRef = db.collection('maindata').doc(messageId);
    const messageDoc = await messageRef.get();

    if (!messageDoc.exists) {
      return new Response(JSON.stringify({ message: 'Not Found: Message not found' }), { status: 404 });
    }

    await messageRef.delete();

    return new Response(JSON.stringify({ message: 'Message deleted successfully' }), { status: 200 });
  } catch (error) {
    console.error('Error deleting message:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
}