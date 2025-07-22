import { getSortedPostsData } from '../../../lib/markdown';
import LearnPageClient from './LearnPageClient';

export default async function LearnPage() {
  const allOfficialPostsData = await getSortedPostsData();
  console.log('Data fetched for LearnPage:', allOfficialPostsData); // Re-adding this log

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h1 className="text-primary">Learning Resources</h1>
      <p>Explore possible useful learning resources for various fields from different sources.</p>
      <LearnPageClient allOfficialPostsData={allOfficialPostsData} userPostsData={[]} />
    </div>
  );
}
