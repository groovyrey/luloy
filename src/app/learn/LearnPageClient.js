'use client';

import Link from 'next/link';
export default function LearnPageClient({ allPostsData }) {
  return (
    <div>
      <ul>
        {allPostsData.map(({ slug, title, date, description }) => (
          <li
            key={slug}
            style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid var(--border-color)' }}
          >
            <Link href={`/learn/${slug}`} style={{ textDecoration: 'none', color: '#0070f3', fontSize: '1.2em' }}>
              {title}
            </Link>
            <p style={{ margin: '5px 0', color: '#666' }}>{description}</p>
            <small style={{ color: '#666' }}>{new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' })}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}