
import { admin } from "/lib/firebase-admin.js";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const firestore = admin.firestore();

export async function POST(request, { params }) {
  const sessionCookie = cookies().get("session")?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decodedToken = await admin.auth().verifySessionCookie(sessionCookie, true);
    const currentUserId = decodedToken.uid; // The user performing the follow action

    const { id: targetUserId } = params; // The user being followed

    if (currentUserId === targetUserId) {
      return NextResponse.json({ error: "Cannot follow yourself." }, { status: 400 });
    }

    const currentUserRef = firestore.collection("users").doc(currentUserId);
    const targetUserRef = firestore.collection("users").doc(targetUserId);

    await firestore.runTransaction(async (transaction) => {
      const currentUserDoc = await transaction.get(currentUserRef);
      const targetUserDoc = await transaction.get(targetUserRef);

      if (!currentUserDoc.exists) {
        throw new Error("Current user not found.");
      }
      if (!targetUserDoc.exists) {
        throw new Error("Target user not found.");
      }

      const currentUserData = currentUserDoc.data();
      const targetUserData = targetUserDoc.data();

      const currentUserFollowing = new Set(currentUserData.following || []);
      const targetUserFollowers = new Set(targetUserData.followers || []);

      if (currentUserFollowing.has(targetUserId)) {
        return NextResponse.json({ message: "Already following." }, { status: 200 });
      }

      currentUserFollowing.add(targetUserId);
      targetUserFollowers.add(currentUserId);

      transaction.update(currentUserRef, {
        following: Array.from(currentUserFollowing),
      });
      transaction.update(targetUserRef, {
        followers: Array.from(targetUserFollowers),
      });
    });

    return NextResponse.json({ message: "User followed successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error following user:", error);
    return NextResponse.json({ error: "Failed to follow user." }, { status: 500 });
  }
}
