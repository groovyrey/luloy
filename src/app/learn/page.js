import { getSortedPostsData } from '../../../lib/markdown';
import LearnPageClient from './LearnPageClient';

export const dynamic = 'force-dynamic'; // Ensure the page is dynamic

export default async function LearnPage() {
  const allOfficialPostsData = await getSortedPostsData();

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h1 className="text-primary">Learning Resources</h1>
      <p>Explore possible useful learning resources for various fields from different sources.</p>
      <p className="text-muted mb-3">Posts support Markdown text formatting. Learn more about <a href="https://www.markdownguide.org/basic-syntax/" target="_blank" rel="noopener noreferrer" className="text-primary">Markdown syntax</a>.</p>
      <LearnPageClient allOfficialPostsData={allOfficialPostsData} userPostsData={[]} />
    </div>
  );
}
