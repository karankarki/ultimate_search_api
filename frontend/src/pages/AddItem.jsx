import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AddItem() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');

  if (!token) {
    navigate('/auth');
    return null;
  }

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userEmail');
          navigate('/auth');
          return;
        }
        setMessage(data.error || 'Unable to add item');
        setLoading(false);
        return;
      }

      setMessage('Item created successfully! Redirecting...');
      setTimeout(() => {
        navigate('/items');
      }, 800);
    } catch (err) {
      setMessage('Unable to connect to server');
      setLoading(false);
    }
  };

  return (
    <div className="add-item-container fade-in">
      <div className="page-card glass-panel">
        <h1 className="gradient-text">Add New Item</h1>
        <form onSubmit={submit} className="add-item-form">
          <div className="input-group">
            <label>Title <span className="required">*</span></label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter item title"
              required
            />
          </div>

          <div className="input-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter item description (optional)"
              rows="5"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn primary-btn" disabled={loading}>
              {loading ? 'Creating...' : 'Create Item'}
            </button>
            <button type="button" className="btn secondary-btn" onClick={() => navigate('/items')}>
              Cancel
            </button>
          </div>
        </form>

        {message && <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</div>}
      </div>
    </div>
  );
}

export default AddItem;
