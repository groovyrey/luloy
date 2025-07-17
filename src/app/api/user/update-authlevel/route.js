import { admin } from "/lib/firebase-admin.js";
import { NextResponse } from "next/server";

export async function PUT(request) {
  let uid, authLevel;
  try {
    ({ uid, authLevel } = await request.json());

    if (!uid || typeof uid !== 'string' || uid.trim().length === 0) {
      console.error("Validation Error: UID is missing or invalid for auth level update.");
      return NextResponse.json({ error: "User ID is required and must be a non-empty string." }, { status: 400 });
    }

    const parsedAuthLevel = parseInt(authLevel);
    if (authLevel === undefined || isNaN(parsedAuthLevel) || parsedAuthLevel < 0 || parsedAuthLevel > 10) { // Assuming authLevel is between 0 and 10
      console.error(`Validation Error for UID ${uid}: Invalid auth level provided: ${authLevel}`);
      return NextResponse.json({ error: "Auth level is required and must be a number between 0 and 10." }, { status: 400 });
    }

    await admin.firestore().collection('users').doc(uid).set({ authLevel: parseInt(authLevel) }, { merge: true });

    return NextResponse.json({ message: "User auth level updated successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error updating user auth level:", error);
    return NextResponse.json({ error: "Failed to update user auth level." }, { status: 500 });
  }
}
