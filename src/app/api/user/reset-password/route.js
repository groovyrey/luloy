import { admin } from "/lib/firebase-admin.js";
import { NextResponse } from "next/server";
import { getComputedPermissions } from "@/app/utils/BadgeSystem";

export async function POST(request) {
  try {
    const { uid, newPassword } = await request.json();
    const authorization = request.headers.get('authorization');

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters long.' }, { status: 400 });
    }

    const idToken = authorization.split(' ')[1];

    // Verify the requesting user's ID token and check permissions
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const requestingUserUid = decodedToken.uid;

    const requestingUserDoc = await admin.firestore().collection('users').doc(requestingUserUid).get();
    if (!requestingUserDoc.exists) {
      return NextResponse.json({ error: 'Requesting user not found.' }, { status: 404 });
    }

    const requestingUserData = requestingUserDoc.data();
    const requestingUserPermissions = getComputedPermissions(requestingUserData.badges);

    if (!requestingUserPermissions.canManageUsers) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions.' }, { status: 403 });
    }

    await admin.auth().updateUser(uid, {
      password: newPassword,
    });

    console.log(`Password for user ${uid} reset by admin ${requestingUserUid}.`);

    return NextResponse.json({ message: 'Password reset successfully.' }, { status: 200 });
  } catch (error) {
    console.error("Error forcing password reset:", error);
    let errorMessage = "Failed to force password reset.";
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'User not found.';
    } else if (error.code === 'auth/invalid-uid') {
      errorMessage = 'Invalid user ID.';
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}