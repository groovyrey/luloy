import { admin } from "/lib/firebase-admin.js";
import { NextResponse } from "next/server";

export async function PUT(request) {
  let uid, firstName, lastName, age, bio, authLevel;
  try {
    ({ uid, firstName, lastName, age, bio, authLevel } = await request.json());

    if (!uid) {
      console.error("Validation Error: UID is missing for user update.");
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    const userRef = admin.firestore().collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const userData = userDoc.data();

    if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
      console.error(`Validation Error for UID ${uid}: Invalid first name provided: ${firstName}`);
      return NextResponse.json({ error: "First name is required and must be a non-empty string." }, { status: 400 });
    }

    if (!lastName || typeof lastName !== 'string' || lastName.trim().length === 0) {
      console.error(`Validation Error for UID ${uid}: Invalid last name provided: ${lastName}`);
      return NextResponse.json({ error: "Last name is required and must be a non-empty string." }, { status: 400 });
    }

    const parsedAge = parseInt(age);
    if (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 150) { // Assuming age is between 0 and 150
      console.error(`Validation Error for UID ${uid}: Invalid age provided: ${age}`);
      return NextResponse.json({ error: "Age must be a valid number between 0 and 150." }, { status: 400 });
    }

    if (bio !== undefined && typeof bio !== 'string') {
      console.error(`Validation Error for UID ${uid}: Invalid bio provided: ${bio}`);
      return NextResponse.json({ error: "Bio must be a string if provided." }, { status: 400 });
    }

    const updateData = {};
    const now = admin.firestore.Timestamp.now();

    // Only update fields that are provided and have changed
    if (firstName !== userData.firstName) {
      updateData.firstName = firstName;
      updateData.fullName = `${firstName} ${lastName}`.toLowerCase(); // Update fullName if firstName changes
      updateData['lastFieldUpdates.firstName'] = now;
    }
    if (lastName !== userData.lastName) {
      updateData.lastName = lastName;
      updateData.fullName = `${firstName} ${lastName}`.toLowerCase(); // Update fullName if lastName changes
      updateData['lastFieldUpdates.lastName'] = now;
    }
    if (parsedAge !== userData.age) {
      updateData.age = parsedAge;
      updateData['lastFieldUpdates.age'] = now;
    }
    if (bio !== undefined && bio !== userData.bio) {
      updateData.bio = bio;
    }
    if (authLevel !== undefined && authLevel !== userData.authLevel) {
      updateData.authLevel = parseInt(authLevel);
    }

    // If no fields are updated, return early
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "No changes to update." }, { status: 200 });
    }

    await userRef.update(updateData);

    return NextResponse.json({ message: "User data updated successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error updating user data:", error);
    return NextResponse.json({ error: "Failed to update user data." }, { status: 500 });
  }
}
