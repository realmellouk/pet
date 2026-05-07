/* pages/Orders.jsx - Buyer order history */
import { useState, useEffect } from 'react';
import { Link, useParams }     from 'react-router-dom';
import { orderAPI }            from '../api/axios';
import toast                   from 'react-hot-toast';
import './Orders.css';

const STATUS_COLORS = {
  pending:    'badge-orange',
  confirmed:  'badge-green',
  processing: 'badge-orange',
  shipped:    'badge-green',
  delivered:  'badge-green',
  cancelled:  'badge-red',
  refunded:   'badge-gray',
};

export function OrderList() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getMyOrders({ limit: 50 })
      .then(r => setOrders(r.data.data))
      .catch(() => toast.error('Could not load orders'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" style={{ marginTop: 140 }} />;

  return (
    <div className="orders-page fade-up" style={{ paddingTop: 100 }}>
      <div className="container">
        <h1 className="orders-page__title">My Orders</h1>

        {!orders.length ? (
          <div className="orders-empty">
            <span>📦</span>
            <h3>No orders yet</h3>
            <p>Your order history will appear here</p>
            <Link to="/products" className="btn btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="order-cards">
            {orders.map(o => (
              <Link key={o.id} to={`/orders/${o.id}`} className="order-card">
                <div className="order-card__header">
                  <div>
                    <span className="order-card__id">Order #{o.id}</span>
                    <span className="order-card__date">{o.created_at?.slice(0,10)}</span>
                  </div>
                  <span className={`badge ${STATUS_COLORS[o.status] || 'badge-gray'}`}>
                    {o.status}
                  </span>
                </div>
                <div className="order-card__body">
                  <div>
                    <span className="order-card__label">Items</span>
                    <strong>{o.item_count}</strong>
                  </div>
                  <div>
                    <span className="order-card__label">Payment</span>
                    <span className={`badge ${o.payment_status === 'paid' ? 'badge-green' : 'badge-orange'}`}>
                      {o.payment_status}
                    </span>
                  </div>
                  <div>
                    <span className="order-card__label">Total</span>
                    <strong>${parseFloat(o.total_amount).toFixed(2)}</strong>
                  </div>
                  <div className="order-card__arrow">→</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function OrderDetail() {
  const { id }            = useParams();
  const [order,  setOrder] = useState(null);
  const [loading,setLoading]= useState(true);

  useEffect(() => {
    orderAPI.getOne(id)
      .then(r => setOrder(r.data.data))
      .catch(() => toast.error('Order not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="spinner" style={{ marginTop: 140 }} />;
  if (!order)  return <p style={{ textAlign: 'center', marginTop: 140 }}>Order not found.</p>;

  return (
    <div className="order-detail-page fade-up" style={{ paddingTop: 100 }}>
      <div className="container">
        <div className="order-detail-header">
          <div>
            <h1>Order #{order.id}</h1>
            <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>
              Placed on {order.created_at?.slice(0, 10)}
            </p>
          </div>
          <span className={`badge ${STATUS_COLORS[order.status] || 'badge-gray'}`} style={{ fontSize: '1rem', padding: '8px 20px' }}>
            {order.status}
          </span>
        </div>

        <div className="order-detail-layout">
          {/* Items */}
          <div>
            <h3 className="order-detail-section-title">Order Items</h3>
            <div className="order-items">
              {order.items?.map((item, i) => (
                <div key={i} className="order-item">
                  {item.product_image && (
                    <img src={item.product_image} alt={item.product_name} className="order-item__img" />
                  )}
                  <div className="order-item__info">
                    <strong>{item.product_name}</strong>
                    {item.shop_name && <p style={{ fontSize: '.8rem', color: 'var(--muted)' }}>{item.shop_name}</p>}
                    <p style={{ fontSize: '.85rem', color: 'var(--warm-gray)' }}>
                      {item.quantity} × ${parseFloat(item.unit_price).toFixed(2)}
                    </p>
                  </div>
                  <div className="order-item__total">
                    ${parseFloat(item.total_price).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="order-totals">
              <div><span>Subtotal</span><span>${(parseFloat(order.total_amount) - parseFloat(order.shipping_amount)).toFixed(2)}</span></div>
              <div><span>Shipping</span><span>${parseFloat(order.shipping_amount).toFixed(2)}</span></div>
              <div className="order-totals__grand"><span>Total</span><strong>${parseFloat(order.total_amount).toFixed(2)}</strong></div>
            </div>
          </div>

          {/* Shipping & Payment */}
          <div>
            <h3 className="order-detail-section-title">Shipping Address</h3>
            <div className="order-detail-box">
              <p><strong>{order.shipping_name}</strong></p>
              <p>{order.shipping_address}</p>
              <p>{order.shipping_city}{order.shipping_zip ? `, ${order.shipping_zip}` : ''}</p>
              <p>📞 {order.shipping_phone}</p>
            </div>

            <h3 className="order-detail-section-title" style={{ marginTop: 24 }}>Payment</h3>
            <div className="order-detail-box">
              <p>Method: <strong style={{ textTransform: 'uppercase' }}>{order.payment_method}</strong></p>
              <p>Status: <span className={`badge ${order.payment_status === 'paid' ? 'badge-green' : 'badge-orange'}`}>{order.payment_status}</span></p>
            </div>

            {order.notes && (
              <>
                <h3 className="order-detail-section-title" style={{ marginTop: 24 }}>Notes</h3>
                <div className="order-detail-box"><p>{order.notes}</p></div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
