import { admin } from "/lib/firebase-admin.js";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const usersRef = admin.firestore().collection("users");
    const staffUsersSnapshot = await usersRef.where("badges", "array-contains", "staff").get();

    const staffUsers = [];
    staffUsersSnapshot.forEach(doc => {
      const userData = doc.data();
      // Filter out sensitive data before sending to client
      staffUsers.push({
        id: doc.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        profilePictureUrl: userData.profilePictureUrl || null,
        authLevel: userData.authLevel || 0,
        badges: userData.badges || [],
      });
    });

    return NextResponse.json(staffUsers, { status: 200 });
  } catch (error) {
    console.error("Error fetching staff users:", error);
    return NextResponse.json({ error: "Failed to fetch staff users." }, { status: 500 });
  }
}
