
import { admin } from "/lib/firebase-admin.js";
import { NextResponse } from "next/server";

const firestore = admin.firestore();

export async function GET(request, { params }) {
  try {
    const { id: userId } = params; // The user whose following list we want

    const userRef = firestore.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const userData = userDoc.data();
    const following = userData.following || [];

    return NextResponse.json({ following }, { status: 200 });
  } catch (error) {
    console.error("Error fetching following list:", error);
    return NextResponse.json({ error: "Failed to fetch following list." }, { status: 500 });
  }
}
