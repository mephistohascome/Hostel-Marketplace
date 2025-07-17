import React, { useState, useCallback } from 'react';
import { CATEGORIES, CONDITIONS } from '../services/api';
import './FilterSection.css';

const FilterSection = ({ filters, onFilterChange, onClearFilters }) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleInputChange = useCallback((field, value) => {
    onFilterChange({ [field]: value });
  }, [onFilterChange]);

  const hasActiveFilters = () => {
    return filters.category !== 'All' || 
           filters.condition !== 'All' || 
           filters.minPrice !== '' || 
           filters.maxPrice !== '';
  };

  return (
    <div className="filter-section">
      <div className="filter-header">
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="filter-toggle"
        >
          🔧 Filters
          <span className={`arrow ${showFilters ? 'up' : 'down'}`}>▼</span>
        </button>
        
        {hasActiveFilters() && (
          <button 
            onClick={onClearFilters}
            className="clear-filters-btn"
          >
            ✕ Clear Filters
          </button>
        )}
      </div>

      <div className={`filter-content ${showFilters ? 'active' : ''}`}>
        <div className="filter-grid">
          {/* Category Filter */}
          <div className="filter-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={filters.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="filter-select"
            >
              {CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Condition Filter */}
          <div className="filter-group">
            <label htmlFor="condition">Condition</label>
            <select
              id="condition"
              value={filters.condition}
              onChange={(e) => handleInputChange('condition', e.target.value)}
              className="filter-select"
            >
              <option value="All">All Conditions</option>
              {CONDITIONS.map(condition => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="filter-group">
            <label htmlFor="minPrice">Min Price</label>
            <input
              type="number"
              id="minPrice"
              value={filters.minPrice}
              onChange={(e) => handleInputChange('minPrice', e.target.value)}
              placeholder="$0"
              min="0"
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="maxPrice">Max Price</label>
            <input
              type="number"
              id="maxPrice"
              value={filters.maxPrice}
              onChange={(e) => handleInputChange('maxPrice', e.target.value)}
              placeholder="$1000"
              min="0"
              className="filter-input"
            />
          </div>
        </div>

        {/* Quick Filter Buttons */}
        <div className="quick-filters">
          <span className="quick-filter-label">Quick filters:</span>
          <button 
            onClick={() => handleInputChange('category', 'Electronics')}
            className={`quick-filter-btn ${filters.category === 'Electronics' ? 'active' : ''}`}
          >
            💻 Electronics
          </button>
          <button 
            onClick={() => handleInputChange('category', 'Books')}
            className={`quick-filter-btn ${filters.category === 'Books' ? 'active' : ''}`}
          >
            📚 Books
          </button>
          <button 
            onClick={() => handleInputChange('category', 'Furniture')}
            className={`quick-filter-btn ${filters.category === 'Furniture' ? 'active' : ''}`}
          >
            🪑 Furniture
          </button>
          <button 
            onClick={() => onFilterChange({ minPrice: '', maxPrice: '100' })}
            className="quick-filter-btn"
          >
            💰 Under $100
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSection;