/* pages/Home.jsx */
import { useState, useEffect } from 'react';
import { Link, useNavigate }   from 'react-router-dom';
import { productAPI }          from '../api/axios';
import ProductCard             from '../components/common/ProductCard';
import {
  Truck, RefreshCw, ShieldCheck, MessageCircle,
  Star, Sparkles, ShoppingBag, Leaf, Package
} from 'lucide-react';
import './Home.css';

const PET_TYPES = [
  { key: 'dog',    label: 'Dogs',     icon: '🐕', color: '#FFF0E6' },
  { key: 'cat',    label: 'Cats',     icon: '🐈', color: '#F0F7FF' },
  { key: 'bird',   label: 'Birds',    icon: '🦜', color: '#EDFAF1' },
  { key: 'fish',   label: 'Fish',     icon: '🐠', color: '#EAF4FF' },
  { key: 'rabbit', label: 'Rabbits',  icon: '🐇', color: '#FFF5F5' },
  { key: 'reptile',label: 'Reptiles', icon: '🦎', color: '#F5FFEA' },
];

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured,   setFeatured]   = useState([]);
  const [newArrivals,setNewArrivals]= useState([]);
  const [search,     setSearch]     = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    productAPI.getCategories().then(r => setCategories(r.data.data));
    productAPI.getAll({ featured: 1, limit: 8 }).then(r => setFeatured(r.data.data));
    productAPI.getAll({ sort: 'created_at', order: 'DESC', limit: 4 }).then(r => setNewArrivals(r.data.data));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${search}`);
  };

  return (
    <main className="home fade-up">
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero__bg">
          <div className="hero__blob hero__blob--1" />
          <div className="hero__blob hero__blob--2" />
        </div>
        <div className="container hero__inner">
          <div className="hero__content">
            <span className="hero__eyebrow"><Star size={14} fill="currentColor" strokeWidth={0} style={{display:'inline',verticalAlign:'middle',marginRight:4}} /> The #1 Pet Supplies Store</span>
            <h1 className="hero__title">
              Everything Your<br />
              <em>Furry Friend</em> Needs
            </h1>
            <p className="hero__subtitle">
              Premium food, toys, accessories, and health products for dogs, cats,
              birds, and more — shipped fast to your door.
            </p>
            <form onSubmit={handleSearch} className="hero__search">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search for pet food, toys, accessories…"
                className="hero__search-input"
              />
              <button type="submit" className="btn btn-primary btn-lg">
                Find Products
              </button>
            </form>
            <div className="hero__stats">
              <div className="hero__stat"><strong>10k+</strong><span>Products</span></div>
              <div className="hero__stat"><strong>500+</strong><span>Sellers</span></div>
              <div className="hero__stat"><strong>50k+</strong><span>Happy Pets</span></div>
            </div>
          </div>
          <div className="hero__visual">
            <div className="hero__img-frame">
              <img src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&q=80"
                alt="Happy pets" className="hero__img" />
              <div className="hero__badge hero__badge--top">
                <Leaf size={15} strokeWidth={2} /> 100% Natural Products
              </div>
              <div className="hero__badge hero__badge--bottom">
                <Truck size={15} strokeWidth={2} /> Free shipping over $50
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PET TYPES ────────────────────────────────────── */}
      <section className="section-sm">
        <div className="container">
          <div className="pet-types">
            {PET_TYPES.map(pt => (
              <Link
                key={pt.key}
                to={`/products?pet_type=${pt.key}`}
                className="pet-type-card"
                style={{ '--pt-color': pt.color }}
              >
                <span className="pet-type-card__emoji">{pt.icon}</span>
                <span className="pet-type-card__label">{pt.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">Find exactly what your pet needs</p>
          <div className="categories-grid">
            {categories.slice(0, 8).map(cat => (
              <Link key={cat.id} to={`/products?category=${cat.slug}`} className="cat-card">
                <span className="cat-card__icon">{cat.icon}</span>
                <div>
                  <h4 className="cat-card__name">{cat.name}</h4>
                  <p className="cat-card__count">{cat.product_count} products</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED ─────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="section" style={{ background: 'var(--cream-dark)' }}>
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title"><Star size={20} fill="currentColor" strokeWidth={0} style={{display:'inline',verticalAlign:'middle',color:'#f59e0b',marginRight:6}} /> Featured Products</h2>
                <p className="section-subtitle">Handpicked favorites for your pets</p>
              </div>
              <Link to="/products?featured=1" className="btn btn-outline">View All</Link>
            </div>
            <div className="grid-4">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── PROMO BANNER ─────────────────────────────────── */}
      <section className="promo-band">
        <div className="container promo-band__inner">
          <div className="promo-band__item">
            <span><Truck size={24} strokeWidth={1.7} /></span>
            <div><strong>Free Shipping</strong><p>On orders over $50</p></div>
          </div>
          <div className="promo-band__item">
            <span><RefreshCw size={24} strokeWidth={1.7} /></span>
            <div><strong>Easy Returns</strong><p>30-day return policy</p></div>
          </div>
          <div className="promo-band__item">
            <span><ShieldCheck size={24} strokeWidth={1.7} /></span>
            <div><strong>Secure Payment</strong><p>100% secure checkout</p></div>
          </div>
          <div className="promo-band__item">
            <span><MessageCircle size={24} strokeWidth={1.7} /></span>
            <div><strong>24/7 Support</strong><p>Always here to help</p></div>
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ──────────────────────────────────── */}
      {newArrivals.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title"><Sparkles size={20} strokeWidth={1.8} style={{display:'inline',verticalAlign:'middle',color:'#8b5cf6',marginRight:6}} /> New Arrivals</h2>
                <p className="section-subtitle">Just landed in our store</p>
              </div>
              <Link to="/products" className="btn btn-outline">Browse All</Link>
            </div>
            <div className="grid-4">
              {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="container cta-section__inner">
          <div className="cta-section__content">
            <h2>Are you a Pet Product Seller?</h2>
            <p>Join 500+ sellers reaching thousands of pet lovers every day.
               Start your store in minutes — no listing fees.</p>
            <Link to="/register" className="btn btn-primary btn-lg">
              Start Selling Today →
            </Link>
          </div>
          <div className="cta-section__emoji"><ShoppingBag size={52} strokeWidth={1.3} style={{opacity:.25}} /></div>
        </div>
      </section>
    </main>
  );
}
