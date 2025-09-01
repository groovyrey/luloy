import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
  const cookieOptions = {
    name: "session",
    value: "",
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  };
  console.log('DEBUG: Clearing session cookie with options:', cookieOptions);

  (await cookies()).set(cookieOptions);

  return NextResponse.json({ status: "success" });
}