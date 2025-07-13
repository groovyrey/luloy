// src/app/api/user/update-username/route.js

import { admin } from "/lib/firebase-admin.js";
import { NextResponse } from "next/server";
import { validateUsername } from "../../../utils/usernameValidation";

const COOLDOWN_PERIOD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export async function POST(request) {
  try {
    const { uid, newUsername } = await request.json();

    if (!uid || !newUsername) {
      return NextResponse.json({ error: "Missing user ID or new username." }, { status: 400 });
    }

    const { isValid, message } = validateUsername(newUsername);
    if (!isValid) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const firestore = admin.firestore();

    await firestore.runTransaction(async (transaction) => {
      const userRef = firestore.collection("users").doc(uid);
      const newUserUsernameRef = firestore.collection("usernames").doc(newUsername);

      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error("User not found.");
      }

      const userData = userDoc.data();
      const currentUsername = userData.username;
      const lastUsernameChange = userData.lastUsernameChange ? userData.lastUsernameChange.toDate().getTime() : 0;

      // Check cooldown period
      if (Date.now() - lastUsernameChange < COOLDOWN_PERIOD_MS) {
        const remainingTimeMs = COOLDOWN_PERIOD_MS - (Date.now() - lastUsernameChange);
        const remainingDays = Math.ceil(remainingTimeMs / (1000 * 60 * 60 * 24));
        throw new Error(`You can only change your username once every 7 days. Please wait ${remainingDays} more day(s).`);
      }

      // Check if new username is already taken
      const newUserUsernameDoc = await transaction.get(newUserUsernameRef);
      if (newUserUsernameDoc.exists) {
        throw new Error("New username is already taken.");
      }

      // Update user document with new username and timestamp
      transaction.update(userRef, {
        username: newUsername,
        lastUsernameChange: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Delete old username mapping if it exists
      if (currentUsername) {
        const oldUsernameRef = firestore.collection("usernames").doc(currentUsername);
        transaction.delete(oldUsernameRef);
      }

      // Create new username mapping
      transaction.set(newUserUsernameRef, { userId: uid });
    });

    return NextResponse.json({ message: "Username updated successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error updating username:", error);
    let errorMessage = "Failed to update username.";
    if (error.message.includes("Username is already taken.") || error.message.includes("You can only change your username once every 7 days.") || error.message.includes("User not found.")) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
