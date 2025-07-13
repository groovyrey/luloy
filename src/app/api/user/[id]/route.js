import { admin, auth } from "/lib/firebase-admin.js";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateUsername } from "../../../utils/usernameValidation";

export async function GET(request, { params }) {
  try {
    const awaitedParams = await params;
    const { id } = awaitedParams; // This 'id' can be a UID or a username

    const firestore = admin.firestore();
    let userDoc;
    let userId = id;

    // Check if the 'id' parameter looks like a username
    const { isValid: isUsernameFormat } = validateUsername(id);

    if (isUsernameFormat) {
      // Attempt to find user by username
      const usernameDoc = await firestore.collection("usernames").doc(id).get();
      if (usernameDoc.exists) {
        userId = usernameDoc.data().userId;
        userDoc = await firestore.collection("users").doc(userId).get();
      } else {
        // If not found by username, it might still be a UID that happens to look like a username
        userDoc = await firestore.collection("users").doc(id).get();
      }
    } else {
      // Assume it's a UID if it doesn't match username format
      userDoc = await firestore.collection("users").doc(id).get();
    }

    if (!userDoc || !userDoc.exists) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const userData = userDoc.data();
    const authLevel = userData.authLevel || 0;

    const publicUserData = {
      uid: userId,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      age: userData.age,
      bio: userData.bio || null,
      profilePictureUrl: userData.profilePictureUrl || null,
      authLevel: authLevel,
      username: userData.username || null, // Include username
      lastUsernameChange: userData.lastUsernameChange || null, // Include lastUsernameChange
    };

    return NextResponse.json(publicUserData, { status: 200 });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json({ error: "Failed to fetch user data." }, { status: 500 });
  }
}
