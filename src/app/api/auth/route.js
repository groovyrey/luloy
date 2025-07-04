
import { admin, auth } from "/lib/firebase-admin.js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = cookies().get("session")?.value || "";

  if (!session) {
    return NextResponse.json({ isLogged: false }, { status: 401 });
  }

  try {
    const decodedClaims = await auth.verifySessionCookie(session, true);
    const uid = decodedClaims.uid;

    const userDoc = await admin.firestore().collection("users").doc(uid).get();
    let authLevel = 0;
    if (userDoc.exists) {
      authLevel = userDoc.data().authLevel || 0;
    }

    return NextResponse.json({ isLogged: true, user: { authLevel: authLevel } });
  } catch (error) {
    console.error("Error verifying session cookie:", error);
    return NextResponse.json({ isLogged: false, message: error.message }, { status: 401 });
  }
}
