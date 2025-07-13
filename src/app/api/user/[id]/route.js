import { admin, auth } from "/lib/firebase-admin.js";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request, { params }) {
  try {
    const awaitedParams = await params;
    const { id } = awaitedParams; // This 'id' is a UID

    const firestore = admin.firestore();
    const userDoc = await firestore.collection("users").doc(id).get();

    if (!userDoc || !userDoc.exists) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const userData = userDoc.data();
    const authLevel = userData.authLevel || 0;

    const publicUserData = {
      uid: id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      age: userData.age,
      bio: userData.bio || null,
      profilePictureUrl: userData.profilePictureUrl || null,
      authLevel: authLevel,
    };

    return NextResponse.json(publicUserData, { status: 200 });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json({ error: "Failed to fetch user data." }, { status: 500 });
  }
}
