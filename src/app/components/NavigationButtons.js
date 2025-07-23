'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NavigationButtons() {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    setCanGoBack(window.history.length > 1);
  }, []);

  return (
    <div className="p-2">
      {canGoBack && (
        <button onClick={() => router.back()} className="btn btn-primary me-2">
          <i className="bi bi-arrow-left"></i> Back
        </button>
      )}
    </div>
  );
}
