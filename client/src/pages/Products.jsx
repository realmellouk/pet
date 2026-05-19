/* pages/Products.jsx */
import { useState, useEffect } from 'react';
import { useSearchParams }     from 'react-router-dom';
import { productAPI }          from '../api/axios';
import ProductCard             from '../components/common/ProductCard';
import {
  SlidersHorizontal, Search, X, LayoutGrid, List,
  ChevronDown, PawPrint, ArrowUpDown,
  Dog, Cat, Bird, Fish, Rabbit, Turtle
} from 'lucide-react';
import './Products.css';

const PET_TYPES = [
  { key: 'dog',     label: 'Dogs',     Icon: Dog },
  { key: 'cat',     label: 'Cats',     Icon: Cat },
  { key: 'bird',    label: 'Birds',    Icon: Bird },
  { key: 'fish',    label: 'Fish',     Icon: Fish },
  { key: 'rabbit',  label: 'Rabbits',  Icon: Rabbit },
  { key: 'reptile', label: 'Reptiles', Icon: Turtle },
  { key: 'other',   label: 'Other',    Icon: PawPrint },
];

const SORT_OPTIONS = [
  { value: 'created_at-DESC', label: 'Newest First' },
  { value: 'price-ASC',       label: 'Price: Low → High' },
  { value: 'price-DESC',      label: 'Price: High → Low' },
  { value: 'rating-DESC',     label: 'Best Rated' },
  { value: 'sales-DESC',      label: 'Best Selling' },
];

/* Collapsible filter section */
function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="filter-group">
      <button className="filter-group__title" onClick={() => setOpen(o => !o)}>
        {title}
        <ChevronDown size={14} strokeWidth={2.5}
          style={{ transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && <div className="filter-group__body">{children}</div>}
    </div>
  );
}

/* Skeleton card */
function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card__img skeleton-pulse" />
      <div className="skeleton-card__body">
        <div className="skeleton-line skeleton-pulse" style={{ width: '60%', height: 12 }} />
        <div className="skeleton-line skeleton-pulse" style={{ width: '90%', height: 16, marginTop: 8 }} />
        <div className="skeleton-line skeleton-pulse" style={{ width: '40%', height: 12, marginTop: 8 }} />
        <div className="skeleton-line skeleton-pulse" style={{ width: '30%', height: 20, marginTop: 12 }} />
      </div>
    </div>
  );
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading,    setLoading]    = useState(true);
  const [viewMode,   setViewMode]   = useState('grid'); // 'grid' | 'list'
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile

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

  const [localSearch, setLocalSearch] = useState(filters.search);

  useEffect(() => {
    productAPI.getCategories().then(r => setCategories(r.data.data));
  }, []);

  useEffect(() => { fetchProducts(); }, [filters]);

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
    const params = {};
    Object.entries(next).forEach(([k, v]) => { if (v) params[k] = v; });
    setSearchParams(params);
  };

  const removeFilter = (key) => updateFilter(key, '');

  const clearFilters = () => {
    const reset = { category:'', pet_type:'', min_price:'', max_price:'', min_rating:'', sort:'created_at', order:'DESC', search:'', featured:'', page:1 };
    setFilters(reset);
    setLocalSearch('');
    setSearchParams({});
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateFilter('search', localSearch.trim());
  };

  // Active filter chips (excluding sort/order/page/search)
  const activeChips = [
    filters.category  && { key: 'category',   label: filters.category },
    filters.pet_type  && { key: 'pet_type',    label: filters.pet_type },
    filters.min_rating&& { key: 'min_rating',  label: `${filters.min_rating}★ & up` },
    filters.min_price && { key: 'min_price',   label: `Min $${filters.min_price}` },
    filters.max_price && { key: 'max_price',   label: `Max $${filters.max_price}` },
    filters.featured  && { key: 'featured',    label: 'Featured' },
  ].filter(Boolean);

  const activeCount = activeChips.length;

  return (
    <div className="products-page fade-up">

      {/* ── Page Hero Header ── */}
      <div className="products-hero">
        <div className="container products-hero__inner">
          <div className="products-hero__text">
            <h1 className="products-hero__title">
              {filters.search
                ? <>Results for "<em>{filters.search}</em>"</>
                : filters.pet_type
                  ? <>{PET_TYPES.find(p => p.key === filters.pet_type)?.label} Products</>
                  : filters.featured
                    ? <>⭐ Featured Products</>
                    : <>All Products</>
              }
            </h1>
            {pagination.total !== undefined && (
              <p className="products-hero__count">
                {pagination.total.toLocaleString()} product{pagination.total !== 1 ? 's' : ''} found
              </p>
            )}
          </div>
          <form className="products-hero__search" onSubmit={handleSearch}>
            <Search size={17} strokeWidth={2.2} className="products-hero__search-icon" />
            <input
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="Search products…"
              className="products-hero__search-input"
            />
            {localSearch && (
              <button type="button" className="products-hero__search-clear"
                onClick={() => { setLocalSearch(''); updateFilter('search', ''); }}>
                <X size={15} strokeWidth={2.5} />
              </button>
            )}
            <button type="submit" className="btn btn-primary btn-sm">Search</button>
          </form>
        </div>
      </div>

      <div className="container">
        <div className="products-layout">

          {/* ── Sidebar overlay (mobile) ── */}
          {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

          {/* ── Sidebar ── */}
          <aside className={`filters-sidebar ${sidebarOpen ? 'filters-sidebar--open' : ''}`}>
            <div className="filters-sidebar__header">
              <div className="filters-sidebar__title">
                <SlidersHorizontal size={16} strokeWidth={2} />
                <span>Filters</span>
                {activeCount > 0 && <span className="filters-badge">{activeCount}</span>}
              </div>
              <button onClick={clearFilters} className="filters-clear">Reset</button>
            </div>

            {/* Category */}
            <FilterSection title="Category">
              {categories.map(cat => (
                <label key={cat.id} className={`filter-option ${filters.category === cat.slug ? 'filter-option--active' : ''}`}>
                  <input type="radio" name="category"
                    checked={filters.category === cat.slug}
                    onChange={() => updateFilter('category', cat.slug)}
                  />
                  <span className="filter-option__label">
                    <span className="filter-option__icon">{cat.icon}</span>
                    {cat.name}
                  </span>
                  <span className="filter-option__count">{cat.product_count}</span>
                </label>
              ))}
            </FilterSection>

            {/* Pet type */}
            <FilterSection title="Pet Type">
              <div className="pet-type-pills">
                {PET_TYPES.map(({ Icon, ...pt }) => (
                  <button
                    key={pt.key}
                    className={`pet-pill ${filters.pet_type === pt.key ? 'pet-pill--active' : ''}`}
                    onClick={() => updateFilter('pet_type', filters.pet_type === pt.key ? '' : pt.key)}
                  >
                    <Icon className="pet-pill__icon" size={18} strokeWidth={2} aria-hidden="true" />
                    {pt.label}
                  </button>
                ))}
              </div>
            </FilterSection>

            {/* Price */}
            <FilterSection title="Price Range">
              <div className="price-inputs">
                <div className="price-input-wrap">
                  <span>$</span>
                  <input type="number" placeholder="Min" className="price-input"
                    value={filters.min_price}
                    onChange={e => updateFilter('min_price', e.target.value)}
                  />
                </div>
                <span className="price-sep">—</span>
                <div className="price-input-wrap">
                  <span>$</span>
                  <input type="number" placeholder="Max" className="price-input"
                    value={filters.max_price}
                    onChange={e => updateFilter('max_price', e.target.value)}
                  />
                </div>
              </div>
            </FilterSection>

            {/* Rating */}
            <FilterSection title="Minimum Rating">
              {[5, 4, 3, 2].map(r => (
                <label key={r} className={`filter-option ${filters.min_rating === String(r) ? 'filter-option--active' : ''}`}>
                  <input type="radio" name="min_rating"
                    checked={filters.min_rating === String(r)}
                    onChange={() => updateFilter('min_rating', String(r))}
                  />
                  <span className="filter-option__stars">
                    {Array.from({ length: 5 }, (_, i) => (
                      <svg key={i} width="13" height="13" viewBox="0 0 24 24"
                        fill={i < r ? 'currentColor' : 'none'}
                        stroke="currentColor" strokeWidth="1.8">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                    <span style={{ color: 'var(--muted)', fontSize: '.8rem', marginLeft: 4 }}>& up</span>
                  </span>
                </label>
              ))}
            </FilterSection>

            {/* Featured toggle */}
            <FilterSection title="Special" defaultOpen={false}>
              <label className={`filter-option ${filters.featured === '1' ? 'filter-option--active' : ''}`}>
                <input type="checkbox"
                  checked={filters.featured === '1'}
                  onChange={e => updateFilter('featured', e.target.checked ? '1' : '')}
                />
                <span>⭐ Featured products only</span>
              </label>
            </FilterSection>
          </aside>

          {/* ── Main Content ── */}
          <div className="products-main">

            {/* Toolbar */}
            <div className="products-toolbar">
              <button className="toolbar-filter-toggle" onClick={() => setSidebarOpen(true)}>
                <SlidersHorizontal size={16} strokeWidth={2} />
                Filters
                {activeCount > 0 && <span className="filters-badge">{activeCount}</span>}
              </button>

              <div className="toolbar-sort">
                <ArrowUpDown size={15} strokeWidth={2} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                <select
                  className="toolbar-sort__select"
                  value={`${filters.sort}-${filters.order}`}
                  onChange={e => {
                    const [sort, order] = e.target.value.split('-');
                    setFilters(f => ({ ...f, sort, order }));
                  }}
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="toolbar-view">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'view-btn--active' : ''}`}
                  onClick={() => setViewMode('grid')} title="Grid view">
                  <LayoutGrid size={18} strokeWidth={1.8} />
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'view-btn--active' : ''}`}
                  onClick={() => setViewMode('list')} title="List view">
                  <List size={18} strokeWidth={1.8} />
                </button>
              </div>
            </div>

            {/* Active filter chips */}
            {activeChips.length > 0 && (
              <div className="active-filters">
                {activeChips.map(chip => (
                  <button key={chip.key} className="active-chip"
                    onClick={() => removeFilter(chip.key)}>
                    {chip.label}
                    <X size={12} strokeWidth={2.5} />
                  </button>
                ))}
                <button className="active-chip active-chip--clear" onClick={clearFilters}>
                  Clear all
                </button>
              </div>
            )}

            {/* Grid / List */}
            {loading ? (
              <div className={viewMode === 'grid' ? 'grid-4' : 'list-view'}>
                {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="products-empty">
                <div className="products-empty__icon">
                  <PawPrint size={48} strokeWidth={1.3} />
                </div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search query</p>
                <button onClick={clearFilters} className="btn btn-primary">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid' ? 'grid-4' : 'list-view'}>
                  {products.map(p => <ProductCard key={p.id} product={p} listMode={viewMode === 'list'} />)}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="pagination">
                    <button
                      className="pagination__btn pagination__btn--nav"
                      disabled={pagination.page <= 1}
                      onClick={() => updateFilter('page', pagination.page - 1)}
                    >← Prev</button>

                    {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                      .filter(p => Math.abs(p - pagination.page) <= 2 || p === 1 || p === pagination.pages)
                      .reduce((acc, p, idx, arr) => {
                        if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, i) => p === '…'
                        ? <span key={`ellipsis-${i}`} className="pagination__ellipsis">…</span>
                        : <button key={p}
                            className={`pagination__btn ${p === pagination.page ? 'pagination__btn--active' : ''}`}
                            onClick={() => updateFilter('page', p)}
                          >{p}</button>
                      )
                    }

                    <button
                      className="pagination__btn pagination__btn--nav"
                      disabled={pagination.page >= pagination.pages}
                      onClick={() => updateFilter('page', pagination.page + 1)}
                    >Next →</button>
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
