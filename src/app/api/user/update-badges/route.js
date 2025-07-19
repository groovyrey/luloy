import { NextResponse } from 'next/server';
import { admin } from "/lib/firebase-admin.js";
import { getComputedPermissions, BADGES } from "@/app/utils/BadgeSystem";

export async function PUT(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      console.error('Error verifying ID token:', error);
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const firestore = admin.firestore();
    const requestingUserDoc = await firestore.collection('users').doc(decodedToken.uid).get();
    const requestingUserData = requestingUserDoc.data();

    const requestingUserPermissions = getComputedPermissions(requestingUserData.badges || []);
    if (!requestingUserPermissions.canAssignBadges) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }

    const { uid, badges } = await request.json();

    if (!uid || !Array.isArray(badges)) {
      return NextResponse.json({ error: 'Invalid request: UID and badges array are required.' }, { status: 400 });
    }

    const targetUserRef = firestore.collection('users').doc(uid);
    const targetUserDoc = await targetUserRef.get();

    if (!targetUserDoc.exists) {
      return NextResponse.json({ error: 'Target user not found.' }, { status: 404 });
    }

    await targetUserRef.update({ badges: badges });

    return NextResponse.json({ message: 'User badges updated successfully.' }, { status: 200 });

  } catch (error) {
    console.error('Error updating user badges:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
