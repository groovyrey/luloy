import { Suspense } from 'react';
import GuestbookClient from './components/GuestbookClient';
import LoadingMessage from '@/app/components/LoadingMessage';

export default function GuestbookPage() {
  return (
    <Suspense fallback={<LoadingMessage />}>
      <GuestbookClient />
    </Suspense>
  );
}