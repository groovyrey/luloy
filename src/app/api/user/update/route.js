import { admin } from "/lib/firebase-admin.js";
import { NextResponse } from "next/server";

export async function PUT(request) {
  try {
    const { uid, firstName, lastName, age, bio, authLevel } = await request.json();

    if (!uid || !firstName || !lastName || !age || isNaN(parseInt(age))) {
      return NextResponse.json({ error: "Missing or invalid user data." }, { status: 400 });
    }

    const updateData = {
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.toLowerCase(), // Update fullName
      age: parseInt(age),
    };

    if (bio !== undefined) {
      updateData.bio = bio;
    }

    if (authLevel !== undefined) {
      updateData.authLevel = parseInt(authLevel);
    }

    await admin.firestore().collection("users").doc(uid).update(updateData);

    return NextResponse.json({ message: "User data updated successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error updating user data:", error);
    return NextResponse.json({ error: "Failed to update user data." }, { status: 500 });
  }
}
