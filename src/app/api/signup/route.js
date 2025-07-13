import { admin } from "/lib/firebase-admin.js";
import { NextResponse } from "next/server";
import { capitalizeName } from "../../utils/capitalizeName";

export async function POST(request) {
  try {
    const { idToken, firstName, lastName, age } = await request.json();

    if (!firstName || !lastName || !age || isNaN(parseInt(age))) {
      return NextResponse.json({ error: "Missing or invalid user data." }, { status: 400 });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const capitalizedFirstName = capitalizeName(firstName);
    const capitalizedLastName = capitalizeName(lastName);

    const firestore = admin.firestore();

    const userRef = firestore.collection("users").doc(uid);

    await userRef.set({
      firstName: capitalizedFirstName,
      lastName: capitalizedLastName,
      fullName: `${capitalizedFirstName} ${capitalizedLastName}`.toLowerCase(), // Add fullName field
      age: parseInt(age),
      email: decodedToken.email,
      authLevel: 0, // Default authLevel for new users
    });

    return NextResponse.json({ message: "User data saved successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error saving user data:", error);
    let errorMessage = "Failed to save user data.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
