import { firestore as db, admin } from '../../../../../lib/firebase-admin.js';
import { NextResponse } from 'next/server';
import { getComputedPermissions } from '../../../utils/BadgeSystem.js';

async function verifyUser(request) {
  const idToken = request.headers.get('authorization')?.split('Bearer ')[1];
  if (!idToken) {
    return null;
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

export async function GET(request, { params }) {
  try {
    const decodedToken = await verifyUser(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();
    const permissions = getComputedPermissions(userData.badges || []);

    if (!permissions.canManageMessages) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;
    const messageRef = db.collection('maindata').doc(id);
    const messageSnap = await messageRef.get();

    if (!messageSnap.exists) {
      return NextResponse.json({ message: 'Message not found' }, { status: 404 });
    }

    const messageData = messageSnap.data();
    return NextResponse.json({ id: messageSnap.id, ...messageData });
  } catch (error) {
    console.error("Error fetching message:", error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const decodedToken = await verifyUser(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();
    const permissions = getComputedPermissions(userData.badges || []);

    if (!permissions.canManageMessages) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;
    const { message, sender } = await request.json();

    const messageRef = db.collection('maindata').doc(id);
    await messageRef.update({ message, sender });

    return NextResponse.json({ message: 'Message updated successfully' });
  } catch (error) {
    console.error("Error updating message:", error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}