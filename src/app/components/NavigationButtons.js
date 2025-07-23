'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NavigationButtons() {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  useEffect(() => {
    setCanGoBack(window.history.length > 1);
    // Natively, we can't know if we can go forward, so this is a simple approach
    // A more complex solution would involve a custom history stack
    // For now, we will assume we can always go forward
    setCanGoForward(true);
  }, []);

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      {canGoBack && (
        <button onClick={() => router.back()} className="btn btn-primary me-2">
          <i className="bi bi-arrow-left"></i>
        </button>
      )}
      {canGoForward && (
        <button onClick={() => router.forward()} className="btn btn-primary">
          <i className="bi bi-arrow-right"></i>
        </button>
      )}
    </div>
  );
}
