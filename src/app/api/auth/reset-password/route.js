
import { auth } from '../../../../../lib/firebase-admin';
import { NextResponse } from 'next/server';
import { sendPasswordResetEmail } from '../../../utils/email';

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log(`Generating password reset link for: ${email}`);
    const link = await auth.generatePasswordResetLink(email);
    console.log(`Password reset link generated: ${link}`);

    console.log(`Sending password reset email to: ${email}`);
    await sendPasswordResetEmail(email, link);
    console.log('Password reset email sent successfully.');

    return NextResponse.json({ message: 'Password reset email sent.' });
  } catch (error) {
    console.error('Error in password reset endpoint:', error);
    return NextResponse.json({ error: 'Failed to send password reset email.' }, { status: 500 });
  }
}
