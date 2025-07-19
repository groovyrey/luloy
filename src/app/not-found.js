import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="card m-2 text-center" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="card-body">
          <div className="text-center mb-4">
            <img src="/luloy.svg" alt="Luloy Logo" style={{ height: '3em', marginBottom: '1em' }} />
            <h2 className="card-title text-center text-danger"><i className="bi bi-exclamation-triangle me-2"></i>Page Not Found</h2>
          </div>
          <p className="text-lg text-muted mb-8">Could not find the requested resource.</p>
          <Link href="/" className="btn btn-primary">
            <i className="bi-house me-2"></i> Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
