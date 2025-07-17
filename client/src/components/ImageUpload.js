import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { apiService } from '../services/api';
import './ImageUpload.css';

const ImageUpload = ({ onImagesChange, initialImages = [] }) => {
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Replace your onDrop function in ImageUpload.js with this debug version:

const onDrop = useCallback(async (acceptedFiles) => {
  console.log('🔵 DEBUG: Upload started');
  console.log('🔵 Files:', acceptedFiles.map(f => ({
    name: f.name,
    size: f.size,
    type: f.type
  })));

  if (acceptedFiles.length === 0) return;

  // Check authentication
  const token = localStorage.getItem('token');
  console.log('🔵 Token exists:', !!token);
  
  if (!token) {
    alert('Please log in to upload images');
    return;
  }

  setUploading(true);

  try {
    const formData = new FormData();
    acceptedFiles.forEach(file => {
      formData.append('images', file);
    });

    console.log('🔵 Making request to upload images...');

    // Make the request with detailed logging
    const response = await fetch('http://localhost:3001/api/upload/images', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    console.log('🔵 Response status:', response.status);
    console.log('🔵 Response headers:', response.headers);

    const responseText = await response.text();
    console.log('🔵 Raw response:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('🔴 Failed to parse response as JSON:', parseError);
      throw new Error('Server returned invalid response');
    }

    console.log('🔵 Parsed response:', responseData);

    if (response.ok && responseData.success) {
      const newImages = responseData.images.map((img, index) => ({
        ...img,
        isPrimary: images.length === 0 && index === 0
      }));

      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      onImagesChange(updatedImages);
      console.log('🔵 Upload successful!');
    } else {
      throw new Error(responseData.message || `Server error: ${response.status}`);
    }
  } catch (error) {
    console.error('🔴 Upload error:', error);
    alert(`Upload failed: ${error.message}`);
  } finally {
    setUploading(false);
  }
}, [images, onImagesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    disabled: uploading
  });

  const removeImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    
    // If we removed the primary image, make the first remaining image primary
    if (images[index].isPrimary && updatedImages.length > 0) {
      updatedImages[0].isPrimary = true;
    }
    
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const setPrimaryImage = (index) => {
    const updatedImages = images.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }));
    
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  return (
    <div className="image-upload-container">
      <label className="upload-label">
        Item Photos (Optional)
        <span className="upload-hint">Upload up to 5 images (5MB each max)</span>
      </label>

      {/* Dropzone */}
      {images.length < 5 && (
        <div 
          {...getRootProps()} 
          className={`dropzone ${isDragActive || dragActive ? 'active' : ''} ${uploading ? 'uploading' : ''}`}
        >
          <input {...getInputProps()} />
          
          <div className="dropzone-content">
            {uploading ? (
              <>
                <div className="upload-spinner"></div>
                <p>Uploading images...</p>
              </>
            ) : (
              <>
                <div className="upload-icon">📸</div>
                <p className="upload-text">
                  {isDragActive ? 'Drop images here...' : 'Drag & drop images here, or click to select'}
                </p>
                <p className="upload-subtext">
                  Supports JPG, PNG, GIF, WebP
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="image-previews">
          <div className="previews-header">
            <span>Uploaded Images ({images.length}/5)</span>
            <span className="primary-hint">Click ⭐ to set as main image</span>
          </div>
          
          <div className="preview-grid">
            {images.map((image, index) => (
              <div key={index} className={`image-preview ${image.isPrimary ? 'primary' : ''}`}>
                <img src={image.url} alt={`Preview ${index + 1}`} />
                
                <div className="image-overlay">
                  <button
                    type="button"
                    onClick={() => setPrimaryImage(index)}
                    className={`primary-btn ${image.isPrimary ? 'active' : ''}`}
                    title={image.isPrimary ? 'Main image' : 'Set as main image'}
                  >
                    ⭐
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="remove-btn"
                    title="Remove image"
                  >
                    ✕
                  </button>
                </div>
                
                {image.isPrimary && (
                  <div className="primary-badge">Main</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="upload-tips">
        <h4>📝 Tips for better photos:</h4>
        <ul>
          <li>Use good lighting and clear focus</li>
          <li>Show the item from multiple angles</li>
          <li>Include any defects or wear clearly</li>
          <li>The first image will be your main display photo</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUpload;