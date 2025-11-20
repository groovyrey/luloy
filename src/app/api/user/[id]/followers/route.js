
import { admin } from "/lib/firebase-admin.js";
import { NextResponse } from "next/server";

const firestore = admin.firestore();

export async function GET(request, { params }) {
  try {
    const awaitedParams = await params;
    const { id: userId } = awaitedParams; // The user whose followers list we want

    const userRef = firestore.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const userData = userDoc.data();
    const followers = userData.followers || [];

    return NextResponse.json({ followers }, { status: 200 });
  } catch (error) {
    console.error("Error fetching followers list:", error);
    return NextResponse.json({ error: "Failed to fetch followers list." }, { status: 500 });
  }
}
