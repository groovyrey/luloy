import { NextResponse } from 'next/server';
import { admin, auth } from "/lib/firebase-admin.js";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    let filename, newAuthorName;
    try {
      ({ filename, newAuthorName } = await request.json());
    } catch (error) {
      console.error("Error parsing JSON for rename author:", error);
      return NextResponse.json({ message: 'Invalid JSON in request body.' }, { status: 400 });
    }

    if (!filename || typeof filename !== 'string' || filename.trim().length === 0) {
      console.error("Validation Error: Invalid or missing filename for author rename.");
      return NextResponse.json({ message: "Filename is required and must be a non-empty string." }, { status: 400 });
    }

    if (!newAuthorName || typeof newAuthorName !== 'string' || newAuthorName.trim().length === 0) {
      console.error(`Validation Error for filename ${filename}: Invalid or missing newAuthorName provided: ${newAuthorName}`);
      return NextResponse.json({ message: "New author name is required and must be a non-empty string." }, { status: 400 });
    }

    const session = (await cookies()).get("session")?.value || "";

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decodedClaims = await auth.verifySessionCookie(session, true);
    const uid = decodedClaims.uid;

    const userDoc = await admin.firestore().collection("users").doc(uid).get();
    let authLevel = 0;
    if (userDoc.exists) {
      authLevel = userDoc.data().authLevel || 0;
    }

    if (authLevel < 1) {
      return NextResponse.json({ message: "Forbidden: Insufficient authorization level to rename author." }, { status: 403 });
    }

    const firestore = admin.firestore();
    const docRef = firestore.collection("filesAuthors").doc(filename);
    await docRef.update({ author: newAuthorName });

    return NextResponse.json({ message: "Author renamed successfully." });
  } catch (error) {
    console.error("Error renaming author:", error);
    return NextResponse.json({ message: "Failed to rename author.", error: error.message }, { status: 500 });
  }
}
