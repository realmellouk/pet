/* components/common/ProductCard.jsx */
import { useState } from 'react';
import { Link }     from 'react-router-dom';
import { useAuth }  from '../../context/AuthContext';
import { useCartStore } from '../../store/cartStore';
import {
  ShoppingCart, Dog, Cat, Bird, Fish, Rabbit, Turtle, PawPrint
} from 'lucide-react';
import toast from 'react-hot-toast';
import './ProductCard.css';

const StarRating = ({ rating }) => {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = rating >= i + 1;
    const half   = !filled && rating >= i + 0.5;
    return (
      <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
        {half ? (
          <>
            <defs>
              <linearGradient id={`half-${i}`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill={`url(#half-${i})`} stroke="currentColor" />
          </>
        ) : (
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        )}
      </svg>
    );
  });
  return (
    <span className="pc-stars" aria-label={`${rating} stars`}>
      {stars}
    </span>
  );
};

const PET_TYPE_ICONS = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  fish: Fish,
  rabbit: Rabbit,
  reptile: Turtle,
  other: PawPrint,
};

export default function ProductCard({ product }) {
  const { user }  = useAuth();
  const { addItem } = useCartStore();
  const [adding, setAdding] = useState(false);
  const isBuyer = user?.role === 'buyer';

  const primaryImage = product.images?.find(i => i.is_primary)?.url
    || product.images?.[0]?.url
    || product.image
    || '/placeholder-pet.jpg';

  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : null;
  const PetTypeIcon = PET_TYPE_ICONS[product.pet_type] || PawPrint;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please sign in to add to cart'); return; }
    if (user.role !== 'buyer') { toast.error('Only buyers can add to cart'); return; }
    try {
      setAdding(true);
      await addItem(product.id);
      toast.success('Added to cart!');
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
            <PetTypeIcon size={16} strokeWidth={2} aria-hidden="true" />
          </span>
        )}
        <div className="pc__overlay">
          {(isBuyer || !user) && (
            <button
              className="btn btn-primary btn-sm pc__cart-btn"
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
            >
              <ShoppingCart size={15} strokeWidth={2} />
              {adding ? 'Adding…' : 'Add to Cart'}
            </button>
          )}
          {product.stock > 0 && user && !isBuyer && (
            <div className="pc__cart-note">Buyers only</div>
          )}
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
