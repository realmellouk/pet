/* pages/Products.jsx */
import { useState, useEffect } from 'react';
import { useSearchParams }     from 'react-router-dom';
import { productAPI }          from '../api/axios';
import ProductCard             from '../components/common/ProductCard';
import './Products.css';

const PET_TYPES = ['dog','cat','bird','fish','rabbit','reptile','other'];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading,    setLoading]    = useState(true);

  // Filters (derived from URL params)
  const [filters, setFilters] = useState({
    category:  searchParams.get('category')  || '',
    pet_type:  searchParams.get('pet_type')  || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    min_rating:searchParams.get('min_rating')|| '',
    sort:      searchParams.get('sort')      || 'created_at',
    order:     searchParams.get('order')     || 'DESC',
    search:    searchParams.get('search')    || '',
    featured:  searchParams.get('featured')  || '',
    page:      parseInt(searchParams.get('page') || '1'),
  });

  useEffect(() => {
    productAPI.getCategories().then(r => setCategories(r.data.data));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '' && v !== false)
      );
      const { data } = await productAPI.getAll(params);
      setProducts(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    const next = { ...filters, [key]: value, page: 1 };
    setFilters(next);
    // Sync to URL
    const params = {};
    Object.entries(next).forEach(([k, v]) => { if (v) params[k] = v; });
    setSearchParams(params);
  };

  const clearFilters = () => {
    const reset = { category:'', pet_type:'', min_price:'', max_price:'', min_rating:'', sort:'created_at', order:'DESC', search:'', featured:'', page:1 };
    setFilters(reset);
    setSearchParams({});
  };

  return (
    <div className="products-page fade-up" style={{ paddingTop: 72 }}>
      <div className="container">
        <div className="products-layout">
          {/* ── Sidebar Filters ─── */}
          <aside className="filters-sidebar">
            <div className="filters-sidebar__header">
              <h3>Filters</h3>
              <button onClick={clearFilters} className="filters-clear">Clear all</button>
            </div>

            {/* Category */}
            <div className="filter-group">
              <h4 className="filter-group__title">Category</h4>
              {categories.map(cat => (
                <label key={cat.id} className="filter-option">
                  <input type="radio" name="category"
                    checked={filters.category === cat.slug}
                    onChange={() => updateFilter('category', cat.slug)}
                  />
                  <span>{cat.icon} {cat.name}</span>
                  <span className="filter-option__count">{cat.product_count}</span>
                </label>
              ))}
            </div>

            {/* Pet type */}
            <div className="filter-group">
              <h4 className="filter-group__title">Pet Type</h4>
              {PET_TYPES.map(pt => (
                <label key={pt} className="filter-option">
                  <input type="radio" name="pet_type"
                    checked={filters.pet_type === pt}
                    onChange={() => updateFilter('pet_type', pt)}
                  />
                  <span style={{textTransform:'capitalize'}}>{pt}</span>
                </label>
              ))}
            </div>

            {/* Price */}
            <div className="filter-group">
              <h4 className="filter-group__title">Price Range</h4>
              <div className="price-inputs">
                <input type="number" placeholder="Min" className="form-control"
                  value={filters.min_price}
                  onChange={e => updateFilter('min_price', e.target.value)}
                />
                <span>–</span>
                <input type="number" placeholder="Max" className="form-control"
                  value={filters.max_price}
                  onChange={e => updateFilter('max_price', e.target.value)}
                />
              </div>
            </div>

            {/* Rating */}
            <div className="filter-group">
              <h4 className="filter-group__title">Minimum Rating</h4>
              {[4, 3, 2].map(r => (
                <label key={r} className="filter-option">
                  <input type="radio" name="min_rating"
                    checked={filters.min_rating === String(r)}
                    onChange={() => updateFilter('min_rating', String(r))}
                  />
                  <span>{'★'.repeat(r)} & up</span>
                </label>
              ))}
            </div>
          </aside>

          {/* ── Main Content ─── */}
          <div className="products-main">
            {/* Toolbar */}
            <div className="products-toolbar">
              <div className="products-toolbar__info">
                {filters.search && <span>Results for "<strong>{filters.search}</strong>"</span>}
                {pagination.total !== undefined && (
                  <span className="products-toolbar__count">
                    {pagination.total} product{pagination.total !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="products-toolbar__sort">
                <select
                  className="form-control"
                  value={`${filters.sort}-${filters.order}`}
                  onChange={e => {
                    const [sort, order] = e.target.value.split('-');
                    setFilters(f => ({ ...f, sort, order }));
                  }}
                >
                  <option value="created_at-DESC">Newest First</option>
                  <option value="price-ASC">Price: Low to High</option>
                  <option value="price-DESC">Price: High to Low</option>
                  <option value="rating-DESC">Best Rated</option>
                  <option value="sales-DESC">Best Selling</option>
                </select>
              </div>
            </div>

            {/* Active filters tags */}
            <div className="active-filters">
              {filters.category && <span className="tag">{filters.category} ✕</span>}
              {filters.pet_type && <span className="tag">{filters.pet_type} ✕</span>}
              {filters.min_rating && <span className="tag">{'★'.repeat(parseInt(filters.min_rating))} & up ✕</span>}
            </div>

            {/* Grid */}
            {loading ? (
              <div className="spinner" />
            ) : products.length === 0 ? (
              <div className="products-empty">
                <span>🐾</span>
                <h3>No products found</h3>
                <p>Try adjusting your filters</p>
                <button onClick={clearFilters} className="btn btn-primary">Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="grid-4">
                  {products.map(p => <ProductCard key={p.id} product={p} />)}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="pagination">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        className={`pagination__btn ${p === pagination.page ? 'pagination__btn--active' : ''}`}
                        onClick={() => updateFilter('page', p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
