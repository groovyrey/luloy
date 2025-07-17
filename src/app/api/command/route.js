
import { spawn } from 'child_process';
import { NextResponse } from 'next/server';
import { auth, admin } from "/lib/firebase-admin.js";
import { cookies } from "next/headers";

export async function GET(request) {
  const session = cookies().get("session")?.value || "";

  if (!session) {
    console.warn("Unauthorized attempt to access command endpoint: No session provided.");
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decodedClaims = await auth.verifySessionCookie(session, true);
    const uid = decodedClaims.uid;

    const userDoc = await admin.firestore().collection("users").doc(uid).get();
    let authLevel = 0;
    if (userDoc.exists) {
      authLevel = userDoc.data().authLevel || 0;
    }

    if (authLevel !== 1) {
      console.warn(`Forbidden attempt to access command endpoint by UID: ${uid} with authLevel: ${authLevel}`);
      return NextResponse.json({ message: 'Forbidden: Insufficient authorization' }, { status: 403 });
    }

    return new Promise((resolve) => {
      const ls = spawn('ls', [' -F']);
      let stdout = '';
      let stderr = '';

      ls.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      ls.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      ls.on('close', (code) => {
        if (code !== 0) {
          console.error(`ls command exited with code ${code}: ${stderr}`);
          resolve(NextResponse.json({ error: 'Failed to execute command' }, { status: 500 }));
        } else {
          resolve(NextResponse.json({ output: stdout, error: stderr }));
        }
      });

      ls.on('error', (err) => {
        console.error(`Failed to start ls command: ${err}`);
        resolve(NextResponse.json({ error: 'Failed to execute command' }, { status: 500 }));
      });
    });
  } catch (error) {
    console.error("Error verifying session or executing command:", error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
