import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import Auth from './pages/Auth';
import Home from './pages/Home';
import About from './pages/About';
import Items from './pages/Items';
import AddItem from './pages/AddItem';
import './App.css';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem('authToken');

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      navigate('/auth');
    }
  };

  return (
    <div className="app-shell">
      <header className="glass-header">
        <div className="logo">
          <Link to="/">Ultimate Search</Link>
        </div>
        <nav className="nav-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
          <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>About</Link>
          
          {isLoggedIn ? (
            <>
              <Link to="/items" className={location.pathname === '/items' ? 'active' : ''}>Items</Link>
              <button onClick={handleLogout} className="btn-link nav-btn">Logout</button>
            </>
          ) : (
            <Link to="/auth" className={location.pathname === '/auth' ? 'active' : ''}>Login / Sign Up</Link>
          )}
        </nav>
      </header>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/items" element={<Items />} />
          <Route path="/add-item" element={<AddItem />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <p>&copy; 2026 Ultimate Search API. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
