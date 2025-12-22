import ArchivePostClient from '../ArchivePostClient';

export default async function Post({ params }) {
  const resolvedParams = await params;
  return <ArchivePostClient slug={resolvedParams.slug} />;
}