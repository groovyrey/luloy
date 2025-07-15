import { getSortedPostsData } from '../../../lib/markdown';
import LearnPageClient from './LearnPageClient';

export default function LearnPage() {
  const allPostsData = getSortedPostsData();

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h1>Learning Resources</h1>
      <p>Explore possible useful learning resources for various fields from different sources.</p>
      <LearnPageClient allPostsData={allPostsData} />
    </div>
  );
}
