import React, { useState, useEffect } from 'react';
import { apiService, CATEGORIES } from '../services/api';
import ItemCard from '../components/ItemCard';
import SearchBar from '../components/SearchBar';
import FilterSection from '../components/FilterSection';
import './Home.css';

const Home = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    minPrice: '',
    maxPrice: '',
    condition: 'All'
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  // Fetch items with current filters
  const fetchItems = async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page,
        limit: 12
      };

      // Only add filters if they have values
      if (filters.search && filters.search.trim()) {
        params.search = filters.search.trim();
      }
      if (filters.category && filters.category !== 'All') {
        params.category = filters.category;
      }
      if (filters.minPrice && filters.minPrice !== '') {
        params.minPrice = filters.minPrice;
      }
      if (filters.maxPrice && filters.maxPrice !== '') {
        params.maxPrice = filters.maxPrice;
      }
      if (filters.condition && filters.condition !== 'All') {
        params.condition = filters.condition;
      }

      console.log('Fetching items with params:', params);
      const response = await apiService.items.getAll(params);
      
      if (response.data.success) {
        setItems(response.data.items);
        setPagination(response.data.pagination);
      } else {
        setError('Failed to fetch items');
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      setError('Failed to fetch items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchItems();
  }, []); // Run once on mount

  // Refetch when filters change (but not on initial load)
  useEffect(() => {
    // Only refetch if filters actually changed (not initial state)
    const hasFilters = filters.search || 
                      filters.category !== 'All' || 
                      filters.minPrice || 
                      filters.maxPrice || 
                      filters.condition !== 'All';
    
    if (hasFilters) {
      fetchItems(1); // Reset to page 1 when filters change
    }
  }, [filters.search, filters.category, filters.minPrice, filters.maxPrice, filters.condition]);

  const handleFilterChange = (newFilters) => {
    console.log('Filter changed:', newFilters);
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handlePageChange = (page) => {
    console.log('Page changed to:', page);
    fetchItems(page);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'All',
      minPrice: '',
      maxPrice: '',
      condition: 'All'
    });
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>🏠 Hostel Marketplace</h1>
          <p>Buy and sell items within your hostel community</p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">{pagination.total}</span>
              <span className="stat-label">Items Available</span>
            </div>
            <div className="stat">
              <span className="stat-number">{CATEGORIES.length - 1}</span>
              <span className="stat-label">Categories</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="search-section">
        <SearchBar 
          value={filters.search}
          onChange={(search) => handleFilterChange({ search })}
          placeholder="Search for items..."
        />
        
        <FilterSection 
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
        />
      </section>

      {/* Items Grid */}
      <section className="items-section">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading items...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <div className="error-message">
              <span>⚠️</span>
              {error}
            </div>
            <button 
              onClick={() => fetchItems()} 
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No items found</h3>
            <p>Try adjusting your search criteria or clear filters</p>
            <button 
              onClick={clearFilters} 
              className="btn btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="items-header">
              <h2>Available Items</h2>
              <span className="items-count">
                {pagination.total} item{pagination.total !== 1 ? 's' : ''} found
              </span>
            </div>
            
            <div className="items-grid">
              {items.map(item => (
                <ItemCard 
                  key={item._id} 
                  item={item}
                  onItemUpdate={() => fetchItems(pagination.current)}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => handlePageChange(pagination.current - 1)}
                  disabled={pagination.current === 1}
                  className="btn btn-secondary"
                >
                  Previous
                </button>
                
                <div className="pagination-info">
                  Page {pagination.current} of {pagination.pages}
                </div>
                
                <button 
                  onClick={() => handlePageChange(pagination.current + 1)}
                  disabled={pagination.current === pagination.pages}
                  className="btn btn-secondary"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default Home;