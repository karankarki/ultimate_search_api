import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Items() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [userEmail] = useState(localStorage.getItem('userEmail') || '');
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');
  const limit = 40;

  useEffect(() => {
    if (!token) {
      navigate('/auth');
      return;
    }

    const loadItems = async () => {
      setLoading(true);
      setMessage('');
      try {
        const url = searchQuery.trim()
          ? `/api/items/search?q=${encodeURIComponent(searchQuery)}&page=${page}&limit=${limit}`
          : `/api/items?page=${page}&limit=${limit}`;

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userEmail');
            navigate('/auth');
            return;
          }
          setMessage(data.error || 'Unable to load items');
          setItems([]);
          return;
        }

        setItems(data.items);
        setTotal(data.total);
        setPages(data.pages);
      } catch (err) {
        setMessage('Unable to connect to server');
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [token, navigate, page, searchQuery]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setPage(1);
  };

  const logout = async () => {
    try {
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

  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= pages) {
      setPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="items-page">
      <div className="page-card">
        <div className="items-header">
          <div>
            <h1>My Items</h1>
            <p className="user-info">Signed in as <strong>{userEmail}</strong></p>
          </div>
          <div className="header-actions">
            <button onClick={() => navigate('/add-item')} className="primary">+ Add Item</button>
            <button className="secondary" onClick={logout}>Logout</button>
          </div>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search items by title..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
          <span className="search-result-count">
            {searchQuery && !loading ? `${total} result${total !== 1 ? 's' : ''}` : total > 0 ? `${total.toLocaleString()} items` : ''}
          </span>
        </div>

        {message && <p className="message error">{message}</p>}

        <div className="items-container">
          {loading ? (
            <div className="empty-state">
              <p>⏳ Loading...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <p>{searchQuery ? `🔍 No items match "${searchQuery}"` : '📭 No items yet'}</p>
              {!searchQuery && (
                <button onClick={() => navigate('/add-item')} className="primary">Create your first item</button>
              )}
            </div>
          ) : (
            <>
              <div className="item-grid">
                {items.map((item) => (
                  <div key={item.id} className="item-card">
                    <div className="item-header">
                      <h3>{item.title}</h3>
                    </div>
                    {item.description && (
                      <p className="item-description">{item.description}</p>
                    )}
                    <span className="item-date">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>

              {pages > 1 && (
                <div className="pagination">
                  <button 
                    disabled={page === 1} 
                    onClick={() => goToPage(page - 1)}
                    className="pagination-btn"
                  >
                    ← Previous
                  </button>
                  <div className="pagination-info">
                    Page <strong>{page}</strong> of <strong>{pages}</strong>
                  </div>
                  <button 
                    disabled={page === pages} 
                    onClick={() => goToPage(page + 1)}
                    className="pagination-btn"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Items;
