'use client';

import Link from 'next/link';
export default function LearnPageClient({ allPostsData }) {
  return (
    <div>
      <ul>
        {allPostsData.map(({ slug, title, date, description }) => (
          <li key={slug} className="learn-list-item">
            <Link href={`/learn/${slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card mb-3" style={{ padding: '15px' }}>
              <h5 style={{ color: 'var(--primary-color)', fontSize: '1.2em' }}>{title}</h5>
            <p style={{ margin: '5px 0', color: 'var(--text-color)' }}>{description}</p>
            <small style={{ color: 'var(--light-text-color)' }}>{new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' })}</small>
            </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}