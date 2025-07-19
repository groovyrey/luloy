
import { auth } from '../../../../../lib/firebase-admin';
import { NextResponse } from 'next/server';
import { sendPasswordResetEmail } from '../../../utils/email';
import { rateLimit } from '../../../utils/rateLimit';

export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for') || req.ip;
  const limited = rateLimit(ip, 3, 60 * 1000); // 3 requests per minute for password reset

  if (!limited.allowed) {
    console.warn(`Rate limit exceeded for IP: ${ip} on password reset`);
    return NextResponse.json({ error: 'Too many password reset requests. Please try again later.' }, { status: 429 });
  }

  let email;
  try {
    ({ email } = await req.json());
  } catch (error) {
    console.error("Error parsing JSON for reset password:", error);
    return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
  }

  try {
    if (!email || !/^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,3}$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    
    const link = await auth.generatePasswordResetLink(email);
    

    
    await sendPasswordResetEmail(email, link);
    

    return NextResponse.json({ message: 'Password reset email sent.' });
  } catch (error) {
    console.error('Error in password reset endpoint:', error);
    return NextResponse.json({ error: 'Failed to send password reset email.' }, { status: 500 });
  }
}
