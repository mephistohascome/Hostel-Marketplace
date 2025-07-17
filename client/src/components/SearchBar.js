import React, { useState, useEffect, useCallback } from 'react';
import './SearchBar.css';

const SearchBar = ({ value, onChange, placeholder = "Search..." }) => {
  const [searchTerm, setSearchTerm] = useState(value);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== value) {
        onChange(searchTerm);
      }
    }, 500); // Increased debounce time to 500ms

    return () => clearTimeout(timer);
  }, [searchTerm, onChange, value]);

  // Update local state when prop changes
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  const handleClear = useCallback(() => {
    setSearchTerm('');
    onChange('');
  }, [onChange]);

  const handleInputChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  return (
    <div className="search-bar">
      <div className="search-input-container">
        <div className="search-icon">
          🔍
        </div>
        
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="search-input"
        />
        
        {searchTerm && (
          <button 
            onClick={handleClear}
            className="clear-button"
            type="button"
          >
            ✕
          </button>
        )}
      </div>
      
      {searchTerm && (
        <div className="search-hint">
          Press Enter to search or wait a moment...
        </div>
      )}
    </div>
  );
};

export default SearchBar;