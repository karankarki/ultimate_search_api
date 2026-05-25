import { Link } from 'react-router-dom';

function Home() {
  const isLoggedIn = !!localStorage.getItem('authToken');

  return (
    <div className="home-container fade-in">
      <div className="hero-section">
        <h1 className="gradient-text">Welcome to Ultimate Search</h1>
        <p className="subtitle">
          Experience the power of modern search API with Redis and Bloom Filters.
          Store, search, and manage your items with ease.
        </p>
        
        <div className="hero-actions">
          {isLoggedIn ? (
            <Link to="/items" className="btn primary-btn btn-large">
              Go to Your Items
            </Link>
          ) : (
            <Link to="/auth" className="btn primary-btn btn-large">
              Get Started Now
            </Link>
          )}
          <Link to="/about" className="btn secondary-btn btn-large">
            Learn More
          </Link>
        </div>
      </div>

      <div className="features-grid">
        <div className="feature-card glass-panel">
          <div className="feature-icon">⚡</div>
          <h3>Lightning Fast</h3>
          <p>Powered by Redis and optimized database queries for sub-millisecond responses.</p>
        </div>
        <div className="feature-card glass-panel">
          <div className="feature-icon">🔒</div>
          <h3>Secure</h3>
          <p>State of the art JWT session-based authentication to keep your data safe.</p>
        </div>
        <div className="feature-card glass-panel">
          <div className="feature-icon">✨</div>
          <h3>Modern UI</h3>
          <p>Beautiful, responsive, and dynamic interface designed for maximum productivity.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
