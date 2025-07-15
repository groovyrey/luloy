import Link from 'next/link';
import { getSortedPostsData } from '../../../lib/markdown';

export default function LearnPage() {
  const allPostsData = getSortedPostsData();

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h1>Learning Resources</h1>
      <p>Explore possible useful learning resources:</p>
      <ul>
        {allPostsData.map(({ slug, title, date }) => (
          <li key={slug} style={{ marginBottom: '10px' }}>
            <Link href={`/learn/${slug}`} style={{ textDecoration: 'none', color: '#0070f3', fontSize: '1.2em' }}>
              {title}
            </Link>
            <br />
            <small style={{ color: '#666' }}>{new Date(date).toLocaleDateString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
