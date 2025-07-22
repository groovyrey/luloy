import { firestore } from '/lib/firebase-admin';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { userId } = await params;

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const snippetsRef = firestore.collection('codes').where('userId', '==', userId).orderBy('createdAt', 'desc');
    const snapshot = await snippetsRef.get();

    const snippets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(snippets);
  } catch (error) {
    console.error('Error fetching user snippets:', error);
    return NextResponse.json({ error: 'Failed to fetch user snippets' }, { status: 500 });
  }
}
