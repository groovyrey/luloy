import { admin } from "/lib/firebase-admin.js";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const usersRef = admin.firestore().collection("users");
    const snapshot = await usersRef.where("email", "==", email).limit(1).get();

    if (!snapshot.empty) {
      const userDoc = snapshot.docs[0];
      return NextResponse.json({ exists: true }, { status: 200 });
    } else {
      return NextResponse.json({ exists: false }, { status: 200 });
    }
  } catch (error) {
    console.error("Error checking user email:", error);
    return NextResponse.json({ error: "Failed to check user email." }, { status: 500 });
  }
}
