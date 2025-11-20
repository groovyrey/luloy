
import { admin } from "/lib/firebase-admin.js";
import { NextResponse } from "next/server";

const firestore = admin.firestore();

export async function POST(request) {
  try {
    const { uids } = await request.json();

    if (!uids || !Array.isArray(uids) || uids.length === 0) {
      return NextResponse.json({ error: "An array of UIDs is required." }, { status: 400 });
    }

    const users = [];
    // Firestore 'in' query has a limit of 10, so we might need to batch if uids.length > 10
    // For simplicity, assuming uids.length <= 10 for now, or fetching individually.
    // A more robust solution would involve batching or a dedicated search index.

    // Fetching individually for now, as 'in' query is limited and might not be suitable for large lists
    for (const uid of uids) {
      const userRef = firestore.collection("users").doc(uid);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        users.push({
          uid: userDoc.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          fullName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
          profilePictureUrl: userData.profilePictureUrl || null,
          bio: userData.bio || null,
        });
      }
    }

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user details by UIDs:", error);
    return NextResponse.json({ error: "Failed to fetch user details." }, { status: 500 });
  }
}
