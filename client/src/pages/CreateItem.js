import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService, CATEGORIES, CONDITIONS } from '../services/api';
import ImageUpload from '../components/ImageUpload';
import './CreateItem.css';

const CreateItem = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    condition: '',
    imageUrl: ''
  });

  const [uploadedImages, setUploadedImages] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImagesChange = (images) => {
    setUploadedImages(images);
  };

  const validateForm = () => {
    if (!formData.title.trim()) return 'Title is required';
    if (!formData.description.trim()) return 'Description is required';
    if (!formData.category) return 'Category is required';
    if (!formData.condition) return 'Condition is required';
    if (!formData.price || formData.price <= 0) return 'Valid price is required';
    if (formData.title.length > 100) return 'Title must be less than 100 characters';
    if (formData.description.length > 500) return 'Description must be less than 500 characters';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const itemData = {
        ...formData,
        price: parseFloat(formData.price),
        images: uploadedImages
      };

      // Set primary image URL for backward compatibility
      const primaryImage = uploadedImages.find(img => img.isPrimary);
      if (primaryImage) {
        itemData.imageUrl = primaryImage.url;
      }

      const response = await apiService.items.create(itemData);

      if (response.data.success) {
        setSuccess('Item created successfully! Redirecting to your items...');
        setTimeout(() => {
          navigate('/my-items');
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to create item');
      }
    } catch (error) {
      console.error('Create item error:', error);
      setError(error.response?.data?.message || 'Failed to create item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      price: '',
      condition: '',
      imageUrl: ''
    });
    setUploadedImages([]);
    setError('');
    setSuccess('');
  };

  return (
    <div className="create-item-container">
      <div className="create-item-header">
        <h1>📦 List New Item</h1>
        <p>Share something with your hostel community</p>
      </div>

      <div className="create-item-card">
        <form onSubmit={handleSubmit} className="create-item-form">
          {error && (
            <div className="error-message">
              <span>⚠️</span>
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              <span>✅</span>
              {success}
            </div>
          )}

          {/* Image Upload Section */}
          <ImageUpload 
            onImagesChange={handleImagesChange}
            initialImages={uploadedImages}
          />

          {/* Title */}
          <div className="form-group">
            <label htmlFor="title">Item Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., MacBook Pro 13-inch"
              maxLength="100"
              required
            />
            <small>{formData.title.length}/100 characters</small>
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your item's condition, features, and any other details..."
              rows="4"
              maxLength="500"
              required
            />
            <small>{formData.description.length}/500 characters</small>
          </div>

          {/* Category and Condition Row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                {CATEGORIES.filter(cat => cat !== 'All').map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="condition">Condition *</label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                required
              >
                <option value="">Select Condition</option>
                {CONDITIONS.map(condition => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price */}
          <div className="form-group">
            <label htmlFor="price">Price (USD) *</label>
            <div className="price-input-container">
              <span className="currency-symbol">$</span>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          {/* Legacy Image URL (as backup) */}
          <div className="form-group">
            <label htmlFor="imageUrl">
              Backup Image URL (Optional)
              <small>Only used if no photos are uploaded above</small>
            </label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Image Preview */}
          {formData.imageUrl && uploadedImages.length === 0 && (
            <div className="image-preview">
              <label>Preview:</label>
              <img 
                src={formData.imageUrl} 
                alt="Item preview"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="image-error" style={{ display: 'none' }}>
                ❌ Invalid image URL
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={resetForm}
              className="btn btn-secondary"
              disabled={loading}
            >
              Reset Form
            </button>
            
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating Item...' : 'Create Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateItem;