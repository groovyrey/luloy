import { admin, auth } from "/lib/firebase-admin.js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = cookies().get("session")?.value || "";

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decodedClaims = await auth.verifySessionCookie(session, true);
    const uid = decodedClaims.uid;

    const userDoc = await admin.firestore().collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    const userData = userDoc.data();

    const { title, content } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ message: "Title and content are required" }, { status: 400 });
    }

    // Basic validation for content size (approximate, as Firestore calculates size differently)
    // 1MB = 1024 * 1024 bytes. Let's set a slightly lower limit for safety.
    const MAX_CONTENT_SIZE_BYTES = 900 * 1024; 
    if (new TextEncoder().encode(content).length > MAX_CONTENT_SIZE_BYTES) {
      return NextResponse.json({ message: "Post content is too large" }, { status: 413 });
    }

    const newPostRef = admin.firestore().collection("userPosts").doc();
    await newPostRef.set({
      userId: uid,
      title,
      content,
      authorFullName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
      authorUsername: userData.username || null,
      authorProfilePictureUrl: userData.profilePictureUrl || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ message: "Post created successfully", postId: newPostRef.id }, { status: 201 });

  } catch (error) {
    console.error("Error creating user post:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
