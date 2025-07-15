import Link from 'next/link';
import { getSortedPostsData } from '../../../lib/markdown';

export default function LearnPage() {
  const allPostsData = getSortedPostsData();

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h1>Learning Resources</h1>
      <p>Explore possible useful learning resources for various fields from different sources.</p>
      <ul>
        {allPostsData.map(({ slug, title, date, description }) => (
          <li key={slug} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid var(--border-color)' }}>
            <Link href={`/learn/${slug}`} style={{ textDecoration: 'none', color: '#0070f3', fontSize: '1.2em' }}>
              {title}
            </Link>
            <p style={{ margin: '5px 0', color: '#666' }}>{description}</p>
            <small style={{ color: '#666' }}>{new Date(date).toLocaleDateString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
