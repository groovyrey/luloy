import { admin } from "/lib/firebase-admin.js";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = await params; // This 'id' is a UID

    const firestore = admin.firestore();
    const userRef = firestore.collection("users").doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    let userData = userDoc.data();

    // Check if the 'badges' field exists. If not, create it.
    if (userData.badges === undefined) {
      await userRef.update({ badges: [] });
      userData.badges = []; // Update the local object to reflect the change immediately
    }

    // We no longer need authLevel, so we ensure it's not sent.
    // The frontend will now rely entirely on the badges array.
    const publicUserData = {
      uid: id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      fullName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
      email: userData.email,
      age: userData.age,
      bio: userData.bio || null,
      profilePictureUrl: userData.profilePictureUrl || null,
      badges: userData.badges, // Send the badges array to the client
    };

    return NextResponse.json(publicUserData, { status: 200 });
  } catch (error) {
    console.error("Error fetching user data:", error.message, error.stack);
    return NextResponse.json({ error: "Failed to fetch user data." }, { status: 500 });
  }
}