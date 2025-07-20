'use client';

import Link from 'next/link';
export default function LearnPageClient({ allPostsData }) {
  return (
    <div>
      <ul>
        {allPostsData.map(({ slug, title, date, description }) => (
          <li key={slug} className="learn-list-item">
            <Link href={`/learn/${slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title mb-2">{title}</h5>
                <p className="mb-1">{description}</p>
                <small className="text-muted">{new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' })}</small>
              </div>
            </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}