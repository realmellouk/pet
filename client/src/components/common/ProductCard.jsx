/* components/common/ProductCard.jsx */
import { useState } from 'react';
import { Link }     from 'react-router-dom';
import { useAuth }  from '../../context/AuthContext';
import { useCartStore } from '../../store/cartStore';
import toast from 'react-hot-toast';
import './ProductCard.css';

const StarRating = ({ rating }) => {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  return (
    <span className="pc-stars" aria-label={`${rating} stars`}>
      {'★'.repeat(full)}
      {half ? '½' : ''}
      {'☆'.repeat(5 - full - (half ? 1 : 0))}
    </span>
  );
};

export default function ProductCard({ product }) {
  const { user }  = useAuth();
  const { addItem } = useCartStore();
  const [adding, setAdding] = useState(false);

  const primaryImage = product.images?.find(i => i.is_primary)?.url
    || product.images?.[0]?.url
    || product.image
    || '/placeholder-pet.jpg';

  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : null;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please sign in to add to cart'); return; }
    if (user.role !== 'buyer') { toast.error('Only buyers can add to cart'); return; }
    try {
      setAdding(true);
      await addItem(product.id);
      toast.success('Added to cart! 🐾');
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link to={`/products/${product.id}`} className="pc">
      {/* Image */}
      <div className="pc__img-wrap">
        <img src={primaryImage} alt={product.name} className="pc__img" loading="lazy" />
        {discount && <span className="pc__discount">-{discount}%</span>}
        {product.stock === 0 && <span className="pc__out">Out of Stock</span>}
        {product.pet_type && (
          <span className="pc__pet-badge">
            {{ dog:'🐕', cat:'🐈', bird:'🦜', fish:'🐠', rabbit:'🐇', reptile:'🦎' }[product.pet_type] || '🐾'}
          </span>
        )}
        <div className="pc__overlay">
          <button
            className="btn btn-primary btn-sm pc__cart-btn"
            onClick={handleAddToCart}
            disabled={adding || product.stock === 0}
          >
            {adding ? 'Adding…' : '+ Add to Cart'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="pc__body">
        {product.category_name && (
          <span className="pc__category">{product.category_name}</span>
        )}
        <h3 className="pc__name">{product.name}</h3>
        {product.shop_name && (
          <p className="pc__shop">{product.shop_name}</p>
        )}

        {/* Rating */}
        <div className="pc__rating">
          <StarRating rating={parseFloat(product.rating) || 0} />
          <span className="pc__review-count">({product.review_count || 0})</span>
        </div>

        {/* Price */}
        <div className="pc__price-row">
          <span className="pc__price">${parseFloat(product.price).toFixed(2)}</span>
          {product.compare_price && (
            <span className="pc__compare">${parseFloat(product.compare_price).toFixed(2)}</span>
          )}
        </div>

        {/* Stock warning */}
        {product.stock > 0 && product.stock <= 5 && (
          <p className="pc__low-stock">Only {product.stock} left!</p>
        )}
      </div>
    </Link>
  );
}
