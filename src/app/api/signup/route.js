import { admin } from "/lib/firebase-admin.js";
import { NextResponse } from "next/server";
import { capitalizeName } from "../../utils/capitalizeName";
import { validateUsername } from "../../utils/usernameValidation";

export async function POST(request) {
  try {
    const { idToken, firstName, lastName, age, username } = await request.json();

    if (!firstName || !lastName || !age || isNaN(parseInt(age)) || !username) {
      return NextResponse.json({ error: "Missing or invalid user data." }, { status: 400 });
    }

    const { isValid, message } = validateUsername(username);
    if (!isValid) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const capitalizedFirstName = capitalizeName(firstName);
    const capitalizedLastName = capitalizeName(lastName);

    const firestore = admin.firestore();

    // Use a transaction to ensure atomicity for username and user creation
    await firestore.runTransaction(async (transaction) => {
      const usernameRef = firestore.collection("usernames").doc(username);
      const userRef = firestore.collection("users").doc(uid);

      const usernameDoc = await transaction.get(usernameRef);

      if (usernameDoc.exists) {
        throw new Error("Username is already taken.");
      }

      transaction.set(usernameRef, { userId: uid });
      transaction.set(userRef, {
        firstName: capitalizedFirstName,
        lastName: capitalizedLastName,
        fullName: `${capitalizedFirstName} ${capitalizedLastName}`.toLowerCase(), // Add fullName field
        age: parseInt(age),
        email: decodedToken.email,
        username: username, // Store username in user document
        authLevel: 0, // Default authLevel for new users
        lastUsernameChange: admin.firestore.FieldValue.serverTimestamp(), // Set initial change timestamp,
      });
    });

    return NextResponse.json({ message: "User data saved successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error saving user data:", error);
    let errorMessage = "Failed to save user data.";
    if (error.message === "Username is already taken.") {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
