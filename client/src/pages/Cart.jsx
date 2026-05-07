/* pages/Cart.jsx */
import { useState, useEffect }  from 'react';
import { Link, useNavigate }    from 'react-router-dom';
import { useCartStore }         from '../store/cartStore';
import { orderAPI }             from '../api/axios';
import { useAuth }              from '../context/AuthContext';
import toast                    from 'react-hot-toast';
import './Cart.css';

export default function Cart() {
  const { user }                        = useAuth();
  const { items, total, loading, fetchCart, updateItem, removeItem } = useCartStore();
  const navigate                        = useNavigate();
  const [step,    setStep]              = useState('cart');   // 'cart' | 'checkout'
  const [placing, setPlacing]           = useState(false);
  const [shipping, setShipping]         = useState({
    shipping_name:    user?.name || '',
    shipping_phone:   user?.phone || '',
    shipping_address: '',
    shipping_city:    '',
    shipping_zip:     '',
    payment_method:   'cod',
    notes:            '',
  });

  useEffect(() => { fetchCart(); }, []);

  const subtotal       = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingCost   = subtotal >= 50 ? 0 : 5.99;
  const grandTotal     = subtotal + shippingCost;

  const handleQtyChange = async (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    try { await updateItem(item.id, newQty); }
    catch { toast.error('Could not update quantity'); }
  };

  const handleRemove = async (id) => {
    try { await removeItem(id); toast.success('Item removed'); }
    catch { toast.error('Failed to remove item'); }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!items.length) return;
    setPlacing(true);
    try {
      const payload = {
        items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
        ...shipping,
      };
      const { data } = await orderAPI.create(payload);
      toast.success('Order placed! 🎉');
      await fetchCart();
      navigate(`/orders/${data.data.order_id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <div className="spinner" style={{ marginTop: 140 }} />;

  if (!items.length && step === 'cart') {
    return (
      <div className="cart-empty fade-up" style={{ paddingTop: 140 }}>
        <span>🛒</span>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet.</p>
        <Link to="/products" className="btn btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="cart-page fade-up" style={{ paddingTop: 90 }}>
      <div className="container">
        <h1 className="cart-page__title">
          {step === 'cart' ? '🛒 Shopping Cart' : '📦 Checkout'}
        </h1>

        {/* Step indicator */}
        <div className="cart-steps">
          <div className={`cart-step ${step === 'cart' ? 'cart-step--active' : 'cart-step--done'}`}>
            <span>1</span> Cart
          </div>
          <div className="cart-step__connector" />
          <div className={`cart-step ${step === 'checkout' ? 'cart-step--active' : ''}`}>
            <span>2</span> Shipping
          </div>
          <div className="cart-step__connector" />
          <div className="cart-step"><span>3</span> Confirm</div>
        </div>

        <div className="cart-layout">
          {/* ── Left: Items or Shipping form ── */}
          <div className="cart-main">
            {step === 'cart' ? (
              <div className="cart-items">
                {items.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item__img">
                      <img src={item.image || '/placeholder-pet.jpg'} alt={item.name} />
                    </div>
                    <div className="cart-item__info">
                      <Link to={`/products/${item.product_id}`} className="cart-item__name">
                        {item.name}
                      </Link>
                      {item.shop_name && <p className="cart-item__shop">{item.shop_name}</p>}
                      <p className="cart-item__unit">${parseFloat(item.price).toFixed(2)} each</p>
                    </div>
                    <div className="cart-item__qty">
                      <button onClick={() => handleQtyChange(item, -1)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleQtyChange(item, +1)}
                        disabled={item.quantity >= item.stock}>+</button>
                    </div>
                    <div className="cart-item__total">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                    <button className="cart-item__remove" onClick={() => handleRemove(item.id)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14H6L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <form onSubmit={handleCheckout} id="checkout-form" className="checkout-form">
                <h3>Shipping Information</h3>
                <div className="checkout-form__grid">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input className="form-control" required
                      value={shipping.shipping_name}
                      onChange={e => setShipping(f => ({...f, shipping_name: e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input className="form-control" required
                      value={shipping.shipping_phone}
                      onChange={e => setShipping(f => ({...f, shipping_phone: e.target.value}))} />
                  </div>
                  <div className="form-group checkout-form__full">
                    <label>Street Address *</label>
                    <input className="form-control" required
                      value={shipping.shipping_address}
                      onChange={e => setShipping(f => ({...f, shipping_address: e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label>City *</label>
                    <input className="form-control" required
                      value={shipping.shipping_city}
                      onChange={e => setShipping(f => ({...f, shipping_city: e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label>ZIP Code</label>
                    <input className="form-control"
                      value={shipping.shipping_zip}
                      onChange={e => setShipping(f => ({...f, shipping_zip: e.target.value}))} />
                  </div>
                </div>

                <h3 style={{marginTop:24}}>Payment Method</h3>
                <div className="payment-methods">
                  {[
                    { value: 'cod',    label: '💵 Cash on Delivery' },
                    { value: 'stripe', label: '💳 Credit Card (Stripe)' },
                    { value: 'paypal', label: '🅿️ PayPal' },
                  ].map(pm => (
                    <label key={pm.value} className={`payment-option ${shipping.payment_method === pm.value ? 'payment-option--active' : ''}`}>
                      <input type="radio" name="payment_method" value={pm.value}
                        checked={shipping.payment_method === pm.value}
                        onChange={e => setShipping(f => ({...f, payment_method: e.target.value}))} />
                      {pm.label}
                    </label>
                  ))}
                </div>

                <div className="form-group" style={{marginTop:16}}>
                  <label>Order Notes (optional)</label>
                  <textarea className="form-control" rows={3} placeholder="Any special instructions…"
                    value={shipping.notes}
                    onChange={e => setShipping(f => ({...f, notes: e.target.value}))} />
                </div>
              </form>
            )}
          </div>

          {/* ── Right: Order Summary ── */}
          <aside className="cart-summary">
            <h3 className="cart-summary__title">Order Summary</h3>
            <div className="cart-summary__lines">
              <div className="cart-summary__line">
                <span>Subtotal ({items.length} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="cart-summary__line">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? <span style={{color:'var(--sage)'}}>FREE</span> : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              {shippingCost > 0 && (
                <p className="cart-summary__free-hint">
                  Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                </p>
              )}
              <div className="cart-summary__divider" />
              <div className="cart-summary__line cart-summary__line--total">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {step === 'cart' ? (
              <button
                className="btn btn-primary btn-full"
                style={{marginTop:20}}
                onClick={() => setStep('checkout')}
              >
                Proceed to Checkout →
              </button>
            ) : (
              <button
                type="submit"
                form="checkout-form"
                className="btn btn-primary btn-full"
                style={{marginTop:20}}
                disabled={placing}
              >
                {placing ? 'Placing Order…' : '✓ Place Order'}
              </button>
            )}

            {step === 'checkout' && (
              <button
                className="btn btn-outline btn-full"
                style={{marginTop:8}}
                onClick={() => setStep('cart')}
              >
                ← Back to Cart
              </button>
            )}

            <div className="cart-summary__guarantees">
              <span>🔒 Secure checkout</span>
              <span>🔄 Easy returns</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
