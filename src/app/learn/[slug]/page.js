import { getPostData, getAllPostSlugs } from '../../../../lib/markdown';
import LearnPostClient from '../LearnPostClient';

export default async function Post({ params }) {
  const resolvedParams = await params;
  const postData = await getPostData(resolvedParams.slug);

  if (!postData) {
    return <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>Post not found.</div>;
  }

  return <LearnPostClient postData={postData} />;
}