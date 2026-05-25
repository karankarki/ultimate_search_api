function About() {
  return (
    <div className="about-container fade-in">
      <div className="about-content glass-panel">
        <h1 className="gradient-text">About Ultimate Search API</h1>
        
        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            Ultimate Search API was built to demonstrate the integration of modern web technologies 
            including Express, React, PostgreSQL, and Redis. It provides a highly efficient and scalable 
            architecture for searching through thousands of records instantly.
          </p>
        </section>

        <section className="about-section">
          <h2>Technology Stack</h2>
          <div className="tech-pills">
            <span className="pill">React 18</span>
            <span className="pill">Vite</span>
            <span className="pill">Node.js</span>
            <span className="pill">Express</span>
            <span className="pill">PostgreSQL</span>
            <span className="pill">Redis</span>
            <span className="pill">JWT</span>
          </div>
        </section>

        <section className="about-section">
          <h2>Security & Features</h2>
          <ul>
            <li>Single-active device session management</li>
            <li>Role-based protected routes</li>
            <li>Bloom filter optimized search indexing</li>
            <li>Premium Glassmorphism UI design</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default About;
