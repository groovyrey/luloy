
import { NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

export async function POST(request) {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized: No session found' }, { status: 401 });
  }

  try {
    const decodedToken = await admin.auth().verifySessionCookie(sessionCookie, true);
    const userId = decodedToken.uid;

    const { notificationId } = await request.json();

    if (notificationId) {
      // Mark a single notification as read
      const notificationRef = admin.firestore().collection('notifications').doc(notificationId);
      const notificationDoc = await notificationRef.get();

      if (!notificationDoc.exists) {
        return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
      }

      if (notificationDoc.data().userId !== userId) {
        return NextResponse.json({ error: 'Forbidden: You do not own this notification' }, { status: 403 });
      }

      await notificationRef.update({ read: true });
      return NextResponse.json({ message: 'Notification marked as read' });
    } else {
      // Mark all notifications as read
      const notificationsQuery = admin.firestore().collection('notifications').where('userId', '==', userId).where('read', '==', false);
      const notificationsSnapshot = await notificationsQuery.get();

      if (notificationsSnapshot.empty) {
        return NextResponse.json({ message: 'No unread notifications to mark as read' });
      }

      const batch = admin.firestore().batch();
      notificationsSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, { read: true });
      });

      await batch.commit();
      return NextResponse.json({ message: 'All notifications marked as read' });
    }
  } catch (error) {
    console.error('Failed to mark notification(s) as read:', error);
    if (error.code === 'auth/session-cookie-expired' || error.code === 'auth/session-cookie-revoked') {
      return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to mark notification(s) as read' }, { status: 500 });
  }
}
