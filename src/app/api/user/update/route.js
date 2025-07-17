import { admin } from "/lib/firebase-admin.js";
import { NextResponse } from "next/server";

export async function PUT(request) {
  let uid, firstName, lastName, age, bio, authLevel;
  try {
    ({ uid, firstName, lastName, age, bio, authLevel } = await request.json());
  } catch (error) {
    console.error("Error parsing JSON for user update:", error);
    return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
  }

    if (!uid) {
      console.error("Validation Error: UID is missing for user update.");
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

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
