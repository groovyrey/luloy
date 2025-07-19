
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
    let badges = [];
    if (userDoc.exists) {
      const userData = userDoc.data();
      authLevel = userData.authLevel || 0;
      badges = userData.badges || [];
    }

    return NextResponse.json({ isLogged: true, user: { authLevel: authLevel, badges: badges } });
  } catch (error) {
    console.error("Error verifying session cookie:", error);
    return NextResponse.json({ isLogged: false, message: error.message }, { status: 401 });
  }
}


