import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ItemCard.css';

const ItemCard = ({ item, onItemUpdate }) => {
  const { user } = useAuth();
  
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

  const isOwner = user && user.id === item.seller?.id;

  return (
    <div className="item-card">
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
        
        <div className="item-badges">
          <span 
            className="condition-badge"
            style={{ backgroundColor: getConditionColor(item.condition) }}
          >
            {item.condition}
          </span>
          {isOwner && (
            <span className="owner-badge">
              Your Item
            </span>
          )}
        </div>
      </div>

      <div className="item-content">
        <div className="item-header">
          <h3 className="item-title">{item.title}</h3>
          <div className="item-price">{formatPrice(item.price)}</div>
        </div>

        <p className="item-description">
          {item.description.length > 100 
            ? `${item.description.substring(0, 100)}...` 
            : item.description
          }
        </p>

        <div className="item-meta">
          <span className="item-category">
            {getCategoryIcon(item.category)} {item.category}
          </span>
          <span className="item-date">
            {formatDate(item.createdAt)}
          </span>
        </div>

        <div className="item-seller">
          <div className="seller-info">
            <span className="seller-name">👤 {item.seller?.name}</span>
            {item.seller?.hostelName && (
              <span className="seller-hostel">🏠 {item.seller.hostelName}</span>
            )}
          </div>
          <div className="item-stats">
            <span className="view-count">👁️ {item.views || 0} views</span>
          </div>
        </div>
      </div>

      <div className="item-actions">
        <Link 
          to={`/item/${item._id}`}
          className="btn btn-primary"
        >
          View Details
        </Link>
        
        {isOwner && (
          <div className="owner-actions">
            <Link 
              to={`/edit-item/${item._id}`}
              className="btn btn-secondary btn-sm"
            >
              Edit
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemCard;