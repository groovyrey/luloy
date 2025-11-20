
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
    const currentUserId = decodedToken.uid; // The user performing the unfollow action

    const { id: targetUserId } = params; // The user being unfollowed

    if (currentUserId === targetUserId) {
      return NextResponse.json({ error: "Cannot unfollow yourself." }, { status: 400 });
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

      if (!currentUserFollowing.has(targetUserId)) {
        return NextResponse.json({ message: "Not following this user." }, { status: 200 });
      }

      currentUserFollowing.delete(targetUserId);
      targetUserFollowers.delete(currentUserId);

      transaction.update(currentUserRef, {
        following: Array.from(currentUserFollowing),
      });
      transaction.update(targetUserRef, {
        followers: Array.from(targetUserFollowers),
      });
    });

    return NextResponse.json({ message: "User unfollowed successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return NextResponse.json({ error: "Failed to unfollow user." }, { status: 500 });
  }
}
