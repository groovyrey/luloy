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
      console.log(`[API/Code/View] Fetched author from Firestore: ${author}`);

      const isUid = /^[a-zA-Z0-9]{20,40}$/.test(author);
      console.log(`[API/Code/View] Is author a UID? ${isUid}`);

      if (isUid) {
        try {
          const userDoc = await firestore.collection("users").doc(author).get();
          if (userDoc.exists) {
            authorDetails = {
              uid: userDoc.id,
              firstName: userDoc.data().firstName,
              lastName: userDoc.data().lastName,
              username: userDoc.data().username || null,
            };
            console.log(`[API/Code/View] Found user details for UID: ${author}`);
          } else {
            console.warn(`[API/Code/View] User document not found for UID: ${author}`);
          }
        } catch (error) {
          console.error(`[API/Code/View] Error fetching author details from Firestore for UID ${author}:`, error);
        }
      }
    }

    return NextResponse.json({ content: fileContent, author: author, authorDetails: authorDetails }, { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Failed to read file or fetch author:', error);
    return NextResponse.json({ error: 'Failed to read file or fetch author' }, { status: 500 });
  }
}