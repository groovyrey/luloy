import { admin } from "/lib/firebase-admin.js";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json({ error: "Search query is required." }, { status: 400 });
    }

    const usersRef = admin.firestore().collection("users");
    const foundUsers = new Map(); // Use a Map to store unique users by UID

    if (query.startsWith('@')) {
      const usernameQuery = query.substring(1).toLowerCase();
      const usernameSnapshot = await usersRef.where("username", ">=", usernameQuery).where("username", "<=", usernameQuery + "\uf8ff").get();
      usernameSnapshot.forEach(doc => {
        foundUsers.set(doc.id, { id: doc.id, ...doc.data() });
      });
    } else {
      const queryLower = query.toLowerCase();
      const fullNameSnapshot = await usersRef.where("fullName", ">=", queryLower).where("fullName", "<=", queryLower + "\uf8ff").get();
      fullNameSnapshot.forEach(doc => {
        foundUsers.set(doc.id, { id: doc.id, ...doc.data() });
      });
    }

    const users = Array.from(foundUsers.values());

    

    // Filter out sensitive data before sending to client
    const publicUsers = users.map((user) => {
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePictureUrl: user.profilePictureUrl || null,
        authLevel: user.authLevel || 0, // Assuming authLevel is now directly in the user's Firestore document
      };
    });

    return NextResponse.json(publicUsers, { status: 200 });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json({ error: "Failed to search users." }, { status: 500 });
  }
}
