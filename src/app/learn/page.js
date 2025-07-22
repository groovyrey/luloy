import { getSortedPostsData } from '../../../lib/markdown';
import LearnPageClient from './LearnPageClient';
import Link from 'next/link';

export default async function LearnPage() {
  const allOfficialPostsData = await getSortedPostsData();

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h1 className="text-primary">Learning Resources</h1>
      <p>Explore possible useful learning resources for various fields from different sources.</p>
      <div className="text-center mb-4">
        <Link href="/upload/blob-upload" className="btn btn-primary">
          Upload Learning Resources
        </Link>
      </div>
      <LearnPageClient allOfficialPostsData={allOfficialPostsData} userPostsData={[]} />
    </div>
  );
}
