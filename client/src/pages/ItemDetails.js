// pages/ItemDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ItemDetails.css';

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiService.items.getById(id);
      
      if (response.data.success) {
        setItem(response.data.item);
      } else {
        setError('Item not found');
      }
    } catch (error) {
      console.error('Error fetching item:', error);
      if (error.response?.status === 404) {
        setError('Item not found');
      } else {
        setError('Failed to load item. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(true);
      
      const response = await apiService.items.delete(id);
      
      if (response.data.success) {
        alert('Item deleted successfully!');
        navigate('/my-items');
      } else {
        alert('Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item. Please try again.');
    } finally {
      setDeleteLoading(false);
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getConditionColor = (condition) => {
    const colors = {
      'New': '#27ae60',
      'Like New': '#2ecc71',
      'Good': '#f39c12',
      'Fair': '#e67e22',
      'Poor': '#e74c3c'
    };
    return colors[condition] || '#95a5a6';
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading item details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <span>⚠️</span>
          {error}
        </div>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="error-container">
        <div className="error-message">
          <span>📦</span>
          Item not found
        </div>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  const isOwner = user && user.id === item.seller?.id;

  return (
    <div className="item-details-container">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span> / </span>
        <span>{item.title}</span>
      </div>

      <div className="item-details-content">
        {/* Image Section */}
        <div className="item-image-section">
          {item.imageUrl ? (
            <img 
              src={item.imageUrl} 
              alt={item.title}
              className="item-detail-image"
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
        </div>

        {/* Details Section */}
        <div className="item-info-section">
          <div className="item-header">
            <h1 className="item-title">{item.title}</h1>
            <div className="item-price">{formatPrice(item.price)}</div>
          </div>

          <div className="item-badges">
            <span 
              className="condition-badge"
              style={{ backgroundColor: getConditionColor(item.condition) }}
            >
              {item.condition}
            </span>
            <span className="category-badge">
              {getCategoryIcon(item.category)} {item.category}
            </span>
            {isOwner && (
              <span className="owner-badge">Your Item</span>
            )}
          </div>

          <div className="item-description">
            <h3>Description</h3>
            <p>{item.description}</p>
          </div>

          <div className="item-meta">
            <div className="meta-item">
              <span className="meta-label">Posted:</span>
              <span className="meta-value">{formatDate(item.createdAt)}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Views:</span>
              <span className="meta-value">{item.views || 0}</span>
            </div>
          </div>

          {/* Seller Information */}
          <div className="seller-section">
            <h3>Seller Information</h3>
            <div className="seller-card">
              <div className="seller-info">
                <div className="seller-name">
                  👤 {item.seller?.name}
                </div>
                {item.seller?.hostelName && (
                  <div className="seller-hostel">
                    🏠 {item.seller.hostelName}
                  </div>
                )}
                {item.seller?.contactNumber && (
                  <div className="seller-contact">
                    📞 {item.seller.contactNumber}
                  </div>
                )}
                {item.seller?.email && (
                  <div className="seller-email">
                    ✉️ {item.seller.email}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="item-actions">
            {isOwner ? (
              <div className="owner-actions">
                <Link 
                  to={`/edit-item/${item._id}`}
                  className="btn btn-secondary"
                >
                  📝 Edit Item
                </Link>
                <button 
                  onClick={handleDelete}
                  className="btn btn-danger"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Deleting...' : '🗑️ Delete Item'}
                </button>
              </div>
            ) : (
              <div className="buyer-actions">
                {item.seller?.email && (
                  <a 
                    href={`mailto:${item.seller.email}?subject=Interested in ${item.title}&body=Hi ${item.seller.name},%0D%0A%0D%0AI'm interested in your item "${item.title}" listed for ${formatPrice(item.price)}.%0D%0A%0D%0APlease let me know if it's still available.%0D%0A%0D%0AThanks!`}
                    className="btn btn-primary"
                  >
                    📧 Contact Seller
                  </a>
                )}
                {item.seller?.contactNumber && (
                  <a 
                    href={`tel:${item.seller.contactNumber}`}
                    className="btn btn-secondary"
                  >
                    📞 Call Seller
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
