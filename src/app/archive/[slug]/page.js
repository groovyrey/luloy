import ArchivePostClient from '../ArchivePostClient';

export default function Post({ params }) {
  return <ArchivePostClient slug={params.slug} />;
}