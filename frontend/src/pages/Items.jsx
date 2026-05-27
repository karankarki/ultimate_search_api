import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Items() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [paginationType, setPaginationType] = useState('offset'); // 'offset' or 'cursor'
  
  // Offset pagination state
  const [page, setPage] = useState(1);
  
  // Cursor pagination state
  const [cursors, setCursors] = useState([]); // Stack of cursors for back navigation
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  
  // Common state
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
        let url;
        
        if (paginationType === 'cursor') {
          // Cursor-based pagination
          const currentCursor = cursors.length > 0 ? cursors[cursors.length - 1] : null;
          url = searchQuery.trim()
            ? `/api/items/search?q=${encodeURIComponent(searchQuery)}&type=cursor&cursor=${currentCursor || ''}&limit=${limit}`
            : `/api/items?type=cursor&cursor=${currentCursor || ''}&limit=${limit}`;
        } else {
          // Offset-based pagination
          url = searchQuery.trim()
            ? `/api/items/search?q=${encodeURIComponent(searchQuery)}&type=offset&page=${page}&limit=${limit}`
            : `/api/items?type=offset&page=${page}&limit=${limit}`;
        }

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
        
        if (paginationType === 'cursor') {
          setNextCursor(data.nextCursor);
          setHasMore(data.hasMore);
        } else {
          // For offset pagination, use hasMore to determine if there's a next page
          setHasMore(data.hasMore);
        }
      } catch (err) {
        setMessage('Unable to connect to server');
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [token, navigate, page, paginationType, searchQuery, cursors]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setPage(1);
    setCursors([]);
    setNextCursor(null);
  };

  const handlePaginationTypeChange = (type) => {
    setPaginationType(type);
    setPage(1);
    setCursors([]);
    setNextCursor(null);
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

  // Offset pagination handlers
  const goToPage = (newPage) => {
    if (newPage >= 1) {
      setPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  // Cursor pagination handlers
  const goToNextPage = () => {
    if (hasMore && nextCursor) {
      setCursors([...cursors, nextCursor]);
      window.scrollTo(0, 0);
    }
  };

  const goToPreviousPage = () => {
    if (cursors.length > 0) {
      const newCursors = cursors.slice(0, -1);
      setCursors(newCursors);
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
        </div>

        <div className="pagination-type-selector">
          <label>Pagination Type:</label>
          <select 
            value={paginationType} 
            onChange={(e) => handlePaginationTypeChange(e.target.value)}
            className="pagination-select"
          >
            <option value="offset">📄 Offset (Page Numbers)</option>
            <option value="cursor">🔗 Cursor (Infinite Scroll)</option>
          </select>
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

              {paginationType === 'offset' ? (
                // Offset Pagination UI
                (page > 1 || hasMore) && (
                  <div className="pagination">
                    <button 
                      disabled={page === 1} 
                      onClick={() => goToPage(page - 1)}
                      className="pagination-btn"
                    >
                      ← Previous
                    </button>
                    <div className="pagination-info">
                      Page <strong>{page}</strong>
                    </div>
                    <button 
                      disabled={!hasMore} 
                      onClick={() => goToPage(page + 1)}
                      className="pagination-btn"
                    >
                      Next →
                    </button>
                  </div>
                )
              ) : (
                // Cursor Pagination UI
                (hasMore || cursors.length > 0) && (
                  <div className="pagination">
                    <button 
                      disabled={cursors.length === 0} 
                      onClick={goToPreviousPage}
                      className="pagination-btn"
                    >
                      ← Previous
                    </button>
                    <div className="pagination-info">
                      {cursors.length > 0 ? `Page ${cursors.length + 1}` : 'Page 1'}
                    </div>
                    <button 
                      disabled={!hasMore} 
                      onClick={goToNextPage}
                      className="pagination-btn"
                    >
                      Next →
                    </button>
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Items;
