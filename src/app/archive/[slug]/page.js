import { getPostData, getAllPostSlugs } from '../../../../lib/markdown';
import ArchivePostClient from '../ArchivePostClient';

export default async function Post({ params }) {
  const resolvedParams = await params;
  const postData = await getPostData(resolvedParams.slug);

  if (!postData) {
    return <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>Post not found.</div>;
  }

  return <ArchivePostClient postData={postData} />;
}