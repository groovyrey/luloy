
import { auth } from "/lib/firebase-admin.js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { rateLimit } from '../../utils/rateLimit';

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for') || request.ip;
  const limited = rateLimit(ip, 5, 60 * 1000); // 5 requests per minute

  if (!limited.allowed) {
    return NextResponse.json({ message: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  let idToken;
  try {
    ({ idToken } = await request.json());
  } catch (error) {
    console.error("Error parsing JSON for login:", error);
    return NextResponse.json({ message: 'Invalid JSON in request body.' }, { status: 400 });
  }

  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

  const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
  console.log('DEBUG: Session cookie created:', sessionCookie);

  const cookieOptions = {
    maxAge: expiresIn,
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
  };
  console.log('DEBUG: Setting session cookie with options:', cookieOptions);

  (await cookies()).set("session", sessionCookie, cookieOptions);

  return NextResponse.json({ status: "success" });
}
