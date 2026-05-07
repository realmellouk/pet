/* pages/ProductDetail.jsx */
import { useState, useEffect } from 'react';
import { useParams, Link }     from 'react-router-dom';
import { productAPI }          from '../api/axios';
import { useAuth }             from '../context/AuthContext';
import { useCartStore }        from '../store/cartStore';
import toast                   from 'react-hot-toast';
import './ProductDetail.css';

const Stars = ({ value, interactive, onChange }) => (
  <div className="stars-row">
    {[1,2,3,4,5].map(s => (
      <span key={s}
        className={`star ${s <= value ? 'star--filled' : ''} ${interactive ? 'star--interactive' : ''}`}
        onClick={() => interactive && onChange(s)}
      >★</span>
    ))}
  </div>
);

export default function ProductDetail() {
  const { id }          = useParams();
  const { user }        = useAuth();
  const { addItem }     = useCartStore();
  const [product, setProduct]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [selImg,  setSelImg]    = useState(0);
  const [qty,     setQty]       = useState(1);
  const [adding,  setAdding]    = useState(false);
  const [review,  setReview]    = useState({ rating: 5, title: '', body: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    productAPI.getOne(id)
      .then(r => setProduct(r.data.data))
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user)               return toast.error('Please sign in');
    if (user.role !== 'buyer') return toast.error('Only buyers can add to cart');
    setAdding(true);
    try {
      await addItem(product.id, qty);
      toast.success(`${qty}× "${product.name}" added to cart 🐾`);
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await productAPI.addReview(id, review);
      toast.success('Review submitted!');
      setReview({ rating: 5, title: '', body: '' });
      // Refresh product to show updated rating
      const r = await productAPI.getOne(id);
      setProduct(r.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="spinner" style={{ marginTop: 120 }} />;
  if (!product) return <p style={{ textAlign: 'center', marginTop: 120 }}>Product not found.</p>;

  const images  = product.images?.length ? product.images : [{ url: '/placeholder-pet.jpg' }];
  const inStock = product.stock > 0;
  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : null;

  return (
    <div className="pd-page fade-up" style={{ paddingTop: 90 }}>
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link> /
          <Link to="/products">Shop</Link> /
          {product.category_name && <Link to={`/products?category=${product.category_name}`}>{product.category_name}</Link>}
          / <span>{product.name}</span>
        </nav>

        <div className="pd-layout">
          {/* ── Gallery ── */}
          <div className="pd-gallery">
            <div className="pd-gallery__main">
              <img src={images[selImg]?.url || images[0]?.url} alt={product.name} className="pd-gallery__img" />
              {discount && <span className="pd-gallery__badge">-{discount}%</span>}
            </div>
            {images.length > 1 && (
              <div className="pd-gallery__thumbs">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelImg(i)}
                    className={`pd-gallery__thumb ${i === selImg ? 'pd-gallery__thumb--active' : ''}`}>
                    <img src={img.url} alt={`View ${i+1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div className="pd-info">
            <div className="pd-info__shop">
              <span>Sold by <strong>{product.shop_name || product.seller_name}</strong></span>
              {product.pet_type && (
                <span className="badge badge-green" style={{textTransform:'capitalize'}}>
                  {product.pet_type}
                </span>
              )}
            </div>

            <h1 className="pd-info__title">{product.name}</h1>

            {/* Rating summary */}
            <div className="pd-info__rating">
              <Stars value={Math.round(product.rating)} />
              <span className="pd-info__rating-val">{parseFloat(product.rating).toFixed(1)}</span>
              <span className="pd-info__rating-count">({product.review_count} reviews)</span>
            </div>

            {/* Price */}
            <div className="pd-info__price-row">
              <span className="pd-info__price">${parseFloat(product.price).toFixed(2)}</span>
              {product.compare_price && (
                <span className="pd-info__compare">${parseFloat(product.compare_price).toFixed(2)}</span>
              )}
              {discount && <span className="badge badge-orange">Save {discount}%</span>}
            </div>

            {/* Description */}
            <p className="pd-info__desc">{product.description}</p>

            {/* Meta */}
            <div className="pd-info__meta">
              {product.brand  && <div><span>Brand</span><strong>{product.brand}</strong></div>}
              {product.weight && <div><span>Weight</span><strong>{product.weight} kg</strong></div>}
              {product.sku    && <div><span>SKU</span><strong>{product.sku}</strong></div>}
              <div>
                <span>Availability</span>
                {inStock
                  ? <strong style={{color:'var(--sage)'}}>✓ In Stock ({product.stock} left)</strong>
                  : <strong style={{color:'#c0392b'}}>✗ Out of Stock</strong>
                }
              </div>
            </div>

            {/* Add to cart */}
            {inStock && (
              <div className="pd-info__actions">
                <div className="qty-control">
                  <button onClick={() => setQty(q => Math.max(1, q-1))}>−</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q+1))}>+</button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="btn btn-primary btn-lg pd-info__cart-btn"
                >
                  {adding ? 'Adding…' : '🛒 Add to Cart'}
                </button>
              </div>
            )}

            {/* Guarantees */}
            <div className="pd-info__guarantees">
              <div>🚚 Free shipping over $50</div>
              <div>🔄 30-day returns</div>
              <div>🔒 Secure checkout</div>
            </div>
          </div>
        </div>

        {/* ── Reviews ── */}
        <section className="pd-reviews">
          <h2 className="pd-reviews__title">Customer Reviews ({product.review_count})</h2>

          <div className="pd-reviews__layout">
            {/* Review list */}
            <div className="pd-reviews__list">
              {product.reviews?.length ? product.reviews.map((r, i) => (
                <div key={i} className="review-card">
                  <div className="review-card__header">
                    <div className="review-card__avatar">
                      {r.reviewer_avatar
                        ? <img src={r.reviewer_avatar} alt={r.reviewer_name} />
                        : <span>{r.reviewer_name?.[0]?.toUpperCase()}</span>
                      }
                    </div>
                    <div>
                      <strong>{r.reviewer_name}</strong>
                      <div style={{display:'flex',gap:8,alignItems:'center'}}>
                        <Stars value={r.rating} />
                        <span style={{fontSize:'.78rem',color:'var(--muted)'}}>{r.created_at?.slice(0,10)}</span>
                      </div>
                    </div>
                  </div>
                  {r.title && <h4 className="review-card__review-title">{r.title}</h4>}
                  {r.body  && <p className="review-card__body">{r.body}</p>}
                  {r.is_verified && <span className="badge badge-green" style={{fontSize:'.72rem'}}>✓ Verified Purchase</span>}
                </div>
              )) : <p style={{color:'var(--muted)'}}>No reviews yet. Be the first!</p>}
            </div>

            {/* Write review form */}
            {user?.role === 'buyer' && (
              <form onSubmit={handleReviewSubmit} className="review-form">
                <h3>Write a Review</h3>
                <div className="form-group">
                  <label>Your Rating</label>
                  <Stars value={review.rating} interactive onChange={r => setReview(f => ({...f, rating: r}))} />
                </div>
                <div className="form-group">
                  <label>Title (optional)</label>
                  <input className="form-control" placeholder="Summary of your review"
                    value={review.title} onChange={e => setReview(f => ({...f, title: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label>Review</label>
                  <textarea className="form-control" rows={4} placeholder="Share your experience…"
                    value={review.body} onChange={e => setReview(f => ({...f, body: e.target.value}))} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                  {submittingReview ? 'Submitting…' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
