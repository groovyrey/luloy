import { NextResponse } from 'next/server';
import { getSortedPostsData } from '../../../../lib/markdown';

export async function GET() {
  try {
    const allOfficialPostsData = await getSortedPostsData();
    return NextResponse.json(allOfficialPostsData);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}
