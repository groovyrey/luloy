import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { admin } from "/lib/firebase-admin.js"; // Import admin for firestore

export async function GET() {
  const dir = path.join(process.cwd(), 'public', 'code');
  const firestore = admin.firestore();
  const filesAuthorsRef = firestore.collection("filesAuthors");

  try {
    // 1. Get files from public/code
    const publicCodeFiles = fs.readdirSync(dir).map(filename => {
      const filePath = path.join(dir, filename);
      const stats = fs.statSync(filePath);
      
      

      const fileData = {
        filename,
        size: stats.size,
        mtime: stats.mtime.getTime(),
      };
      
      return fileData;
    });

    // 2. Get filesAuthors from Firestore
    const filesAuthorsSnapshot = await filesAuthorsRef.get();
    const filesAuthors = {};
    filesAuthorsSnapshot.forEach(doc => {
      filesAuthors[doc.id] = doc.data();
    });

    // 3. Synchronize: Add new files to Firestore, delete non-existent ones
    const filesToReturn = [];
    const publicCodeFilenames = new Set(publicCodeFiles.map(f => f.filename));

    // Add new files to Firestore and prepare data for response
    for (const file of publicCodeFiles) {
      if (!filesAuthors[file.filename]) {
        // New file, add to Firestore with "Unknown" author
        await filesAuthorsRef.doc(file.filename).set({ author: "Unknown" });
        filesAuthors[file.filename] = { author: "Unknown" }; // Update local cache
      }
      filesToReturn.push({ ...file, author: filesAuthors[file.filename].author });
    }

    // Delete non-existent files from Firestore
    for (const filename in filesAuthors) {
      if (!publicCodeFilenames.has(filename)) {
        await filesAuthorsRef.doc(filename).delete();
        delete filesAuthors[filename]; // Update local cache
      }
    }

    return NextResponse.json(filesToReturn);

  } catch (error) {
    console.error('Failed to read directory or synchronize authors:', error);
    return NextResponse.json({ error: 'Failed to read directory or synchronize authors' }, { status: 500 });
  }
}

