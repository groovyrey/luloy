import { Suspense } from 'react';
import UserSettingsClient from './components/UserSettingsClient';
import LoadingMessage from '@/app/components/LoadingMessage';

export default function EditUserPage() {
  return (
    <Suspense fallback={<LoadingMessage />}>
      <UserSettingsClient />
    </Suspense>
  );
}
