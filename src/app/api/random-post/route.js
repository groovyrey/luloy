import { getSortedPostsData } from '../../../../lib/markdown';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const allPosts = await getSortedPostsData();

    if (allPosts.length === 0) {
      return NextResponse.json({ message: 'No posts found.' }, { status: 404 });
    }

    const randomIndex = Math.floor(Math.random() * allPosts.length);
    const randomPost = allPosts[randomIndex];

    // Return only necessary metadata for the homepage display
    return NextResponse.json({
      slug: randomPost.slug,
      title: randomPost.title,
      description: randomPost.description,
    });
  } catch (error) {
    console.error('Error fetching random post:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
