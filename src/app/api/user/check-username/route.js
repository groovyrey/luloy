// src/app/api/user/check-username/route.js

import { admin } from "/lib/firebase-admin.js";
import { NextResponse } from "next/server";
import { validateUsername } from "../../../utils/usernameValidation";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: "Username parameter is required." }, { status: 400 });
    }

    const { isValid, message } = validateUsername(username);
    if (!isValid) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const firestore = admin.firestore();
    const usernameDoc = await firestore.collection("usernames").doc(username).get();

    if (usernameDoc.exists) {
      return NextResponse.json({ isAvailable: false, message: "Username is already taken." }, { status: 200 });
    } else {
      return NextResponse.json({ isAvailable: true, message: "Username is available." }, { status: 200 });
    }
  } catch (error) {
    console.error("Error checking username availability:", error);
    return NextResponse.json({ error: "Failed to check username availability." }, { status: 500 });
  }
}
