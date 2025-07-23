import { Suspense } from 'react';
import MessagesClient from './components/MessagesClient';
import LoadingMessage from '@/app/components/LoadingMessage';

export default function MessagesPage() {
  return (
    <Suspense fallback={<LoadingMessage />}>
      <MessagesClient />
    </Suspense>
  );
}