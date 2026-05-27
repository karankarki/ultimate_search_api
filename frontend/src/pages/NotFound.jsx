import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="empty-state fade-in" style={{ marginTop: '100px' }}>
      <div className="feature-icon" style={{ fontSize: '72px' }}>🤔</div>
      <h1 className="gradient-text" style={{ fontSize: '48px', marginBottom: '16px' }}>404</h1>
      <h2 style={{ color: 'var(--text-main)', marginBottom: '16px' }}>Page Not Found</h2>
      <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '32px' }}>
        Oops! The route you are looking for doesn't exist.
      </p>
      <Link to="/" className="btn primary-btn btn-large">
        Go Back Home
      </Link>
    </div>
  );
}

export default NotFound;
