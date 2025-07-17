// pages/MyItems.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './MyItems.css';

const MyItems = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyItems();
  }, []);

  const fetchMyItems = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiService.items.getMyItems();
      
      if (response.data.success) {
        setItems(response.data.items);
      } else {
        setError('Failed to fetch your items');
      }
    } catch (error) {
      console.error('Error fetching my items:', error);
      setError('Failed to fetch your items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId, itemTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${itemTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await apiService.items.delete(itemId);
      
      if (response.data.success) {
        setItems(prev => prev.filter(item => item._id !== itemId));
        alert('Item deleted successfully!');
      } else {
        alert('Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  const toggleAvailability = async (itemId, currentStatus) => {
    try {
      const response = await apiService.items.update(itemId, {
        isAvailable: !currentStatus
      });
      
      if (response.data.success) {
        setItems(prev => prev.map(item => 
          item._id === itemId 
            ? { ...item, isAvailable: !currentStatus }
            : item
        ));
      } else {
        alert('Failed to update item status');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item. Please try again.');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Books': '📚',
      'Electronics': '💻',
      'Furniture': '🪑',
      'Clothing': '👕',
      'Kitchen Items': '🍳',
      'Sports Equipment': '⚽',
      'Stationery': '✏️',
      'Decoration': '🎨',
      'Others': '📦'
    };
    return icons[category] || '📦';
  };

  const getStats = () => {
    const available = items.filter(item => item.isAvailable).length;
    const sold = items.filter(item => !item.isAvailable).length;
    const totalViews = items.reduce((sum, item) => sum + (item.views || 0), 0);
    const totalValue = items.filter(item => item.isAvailable).reduce((sum, item) => sum + item.price, 0);

    return { available, sold, totalViews, totalValue };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your items...</p>
      </div>
    );
  }

  return (
    <div className="my-items-container">
      <div className="my-items-header">
        <div className="header-content">
          <h1>📦 My Items</h1>
          <p>Welcome back, {user?.name}! Manage your marketplace listings</p>
        </div>
        <Link to="/create-item" className="btn btn-primary">
          + Add New Item
        </Link>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <div className="stat-number">{items.length}</div>
            <div className="stat-label">Total Items</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-number">{stats.available}</div>
            <div className="stat-label">Available</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <div className="stat-number">{formatPrice(stats.totalValue)}</div>
            <div className="stat-label">Total Value</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👁️</div>
          <div className="stat-info">
            <div className="stat-number">{stats.totalViews}</div>
            <div className="stat-label">Total Views</div>
          </div>
        </div>
      </div>

      {/* Items Section */}
      {error ? (
        <div className="error-container">
          <div className="error-message">
            <span>⚠️</span>
            {error}
          </div>
          <button onClick={fetchMyItems} className="btn btn-primary">
            Try Again
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No items yet</h3>
          <p>Start selling by creating your first item listing</p>
          <Link to="/create-item" className="btn btn-primary">
            Create Your First Item
          </Link>
        </div>
      ) : (
        <div className="items-grid">
          {items.map(item => (
            <div key={item._id} className={`my-item-card ${!item.isAvailable ? 'sold' : ''}`}>
              <div className="item-image-container">
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl} 
                    alt={item.title}
                    className="item-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="item-image-placeholder"
                  style={{ display: item.imageUrl ? 'none' : 'flex' }}
                >
                  <span className="category-icon">
                    {getCategoryIcon(item.category)}
                  </span>
                </div>
                
                {!item.isAvailable && (
                  <div className="sold-overlay">
                    <span>SOLD</span>
                  </div>
                )}
              </div>

              <div className="item-content">
                <div className="item-header">
                  <h3 className="item-title">{item.title}</h3>
                  <div className="item-price">{formatPrice(item.price)}</div>
                </div>

                <div className="item-meta">
                  <span className="item-category">
                    {getCategoryIcon(item.category)} {item.category}
                  </span>
                  <span className="item-views">
                    👁️ {item.views || 0} views
                  </span>
                </div>

                <div className="item-date">
                  Posted on {formatDate(item.createdAt)}
                </div>

                <div className="item-actions">
                  <Link 
                    to={`/item/${item._id}`}
                    className="btn btn-outline"
                  >
                    View
                  </Link>
                  
                  <button
                    onClick={() => toggleAvailability(item._id, item.isAvailable)}
                    className={`btn ${item.isAvailable ? 'btn-warning' : 'btn-success'}`}
                  >
                    {item.isAvailable ? 'Mark Sold' : 'Mark Available'}
                  </button>
                  
                  <button
                    onClick={() => handleDelete(item._id, item.title)}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyItems;
