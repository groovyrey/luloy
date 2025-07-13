import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { admin } from "/lib/firebase-admin.js";

export async function GET(request, context) {
  const resolvedParams = await context.params;
  const filename = resolvedParams.filename.join('/');
  const filePath = path.join(process.cwd(), 'public', 'code', filename);

  try {
    // Basic security check: prevent directory traversal
    if (!filePath.startsWith(path.join(process.cwd(), 'public', 'code')) || !fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found or unauthorized access attempt' }, { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');

    const firestore = admin.firestore();
    const docRef = firestore.collection("filesAuthors").doc(filename);
    const docSnap = await docRef.get();

    let author = "Unknown";
    let authorDetails = null;

    if (docSnap.exists) {
      author = docSnap.data().author || "Unknown";

      // Check if the author string is an email
      const emailRegex = /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,3}$/;
      if (emailRegex.test(author)) {
        // Query Firestore for a user with this email
        const usersSnapshot = await firestore.collection("users").where("email", "==", author).limit(1).get();
        if (!usersSnapshot.empty) {
          const userDoc = usersSnapshot.docs[0];
          authorDetails = {
            uid: userDoc.id,
            firstName: userDoc.data().firstName,
            lastName: userDoc.data().lastName,
            username: userDoc.data().username || null,
          };
        }
      } else {
        // Try to find user by username
        let usersSnapshot = await firestore.collection("users").where("username", "==", author).limit(1).get();
        if (usersSnapshot.empty) {
          // If not found by username, try by UID
          usersSnapshot = await firestore.collection("users").where(admin.firestore.FieldPath.documentId(), "==", author).limit(1).get();
        }

        if (!usersSnapshot.empty) {
          const userDoc = usersSnapshot.docs[0];
          authorDetails = {
            uid: userDoc.id,
            firstName: userDoc.data().firstName,
            lastName: userDoc.data().lastName,
            username: userDoc.data().username || null,
          };
        }
      }
    }

    return NextResponse.json({ content: fileContent, author: author, authorDetails: authorDetails }, { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Failed to read file or fetch author:', error);
    return NextResponse.json({ error: 'Failed to read file or fetch author' }, { status: 500 });
  }
}