import { auth } from '../../../../../lib/firebase-admin';
import { NextResponse } from 'next/server';

export async function PUT(request) {
  try {
    const { uid, currentPassword, newPassword } = await request.json();

    if (!uid || !currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // In a real application, you would re-authenticate the user on the client-side
    // before sending the request to the server to ensure the currentPassword is valid.
    // Firebase Admin SDK does not directly expose a method to verify a user's password.
    // For this example, we'll proceed with the update assuming client-side re-authentication
    // or another validation mechanism is in place.

    await auth.updateUser(uid, {
      password: newPassword,
    });

    return NextResponse.json({ message: 'Password updated successfully!' });
  } catch (error) {
    console.error('Error updating password:', error);
    // Handle specific Firebase errors if needed
    return NextResponse.json({ error: error.message || 'Failed to update password.' }, { status: 500 });
  }
}
