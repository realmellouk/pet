/* pages/seller/SellerDashboard.jsx */
import { useState, useEffect, useRef } from 'react';
import { createPortal }               from 'react-dom';
import { Link }                        from 'react-router-dom';
import { productAPI, orderAPI }        from '../../api/axios';
import { useAuth }                     from '../../context/AuthContext';
import {
  Package, ShoppingBag, Clock, DollarSign,
  BarChart2, AlertTriangle, Plus, X, Star
} from 'lucide-react';
import toast                           from 'react-hot-toast';
import './Seller.css';

/* ── Sub-view: Stats card ── */
const StatCard = ({ icon, label, value, sub }) => (
  <div className="stat-card">
    <span className="stat-card__icon">{icon}</span>
    <div>
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{label}</div>
      {sub && <div className="stat-card__sub">{sub}</div>}
    </div>
  </div>
);

/* ── Add/Edit Product Modal ── */
function ProductModal({ product, onClose, onSaved, categories }) {
  const [form, setForm] = useState(product ? {
    name: product.name, description: '', price: product.price,
    compare_price: '', stock: product.stock, category_id: product.category_id,
    brand: product.brand || '', pet_type: product.pet_type, sku: '', weight: '',
  } : {
    name: '', description: '', price: '', compare_price: '', stock: 0,
    category_id: '', brand: '', pet_type: 'dog', sku: '', weight: '',
  });
  const [files,   setFiles]   = useState([]);
  const [saving,  setSaving]  = useState(false);
  const fileRef               = useRef();

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (product) {
        await productAPI.update(product.id, form);
        toast.success('Product updated!');
      } else {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
        files.forEach(f => fd.append('images', f));
        await productAPI.create(fd);
        toast.success('Product created!');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="modal__close"><X size={18} strokeWidth={2.5} /></button>
        </div>
        <form onSubmit={handleSave} className="modal__body">
          <div className="modal-grid">
            <div className="form-group modal-grid__full">
              <label>Product Name *</label>
              <input className="form-control" required
                value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
            </div>
            <div className="form-group modal-grid__full">
              <label>Description *</label>
              <textarea className="form-control" rows={3} required
                value={form.description}
                onChange={e => setForm(f => ({...f, description: e.target.value}))} />
            </div>
            <div className="form-group">
              <label>Price ($) *</label>
              <input type="number" min="0" step="0.01" className="form-control" required
                value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} />
            </div>
            <div className="form-group">
              <label>Compare Price ($)</label>
              <input type="number" min="0" step="0.01" className="form-control"
                value={form.compare_price}
                onChange={e => setForm(f => ({...f, compare_price: e.target.value}))} />
            </div>
            <div className="form-group">
              <label>Stock *</label>
              <input type="number" min="0" className="form-control" required
                value={form.stock} onChange={e => setForm(f => ({...f, stock: e.target.value}))} />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select className="form-control" required
                value={form.category_id}
                onChange={e => setForm(f => ({...f, category_id: e.target.value}))}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Pet Type</label>
              <select className="form-control"
                value={form.pet_type}
                onChange={e => setForm(f => ({...f, pet_type: e.target.value}))}>
                {['dog','cat','bird','fish','rabbit','reptile','other'].map(t =>
                  <option key={t} value={t} style={{textTransform:'capitalize'}}>{t}</option>
                )}
              </select>
            </div>
            <div className="form-group">
              <label>Brand</label>
              <input className="form-control"
                value={form.brand} onChange={e => setForm(f => ({...f, brand: e.target.value}))} />
            </div>
            <div className="form-group">
              <label>Weight (kg)</label>
              <input type="number" step="0.01" className="form-control"
                value={form.weight} onChange={e => setForm(f => ({...f, weight: e.target.value}))} />
            </div>
            <div className="form-group">
              <label>SKU</label>
              <input className="form-control"
                value={form.sku} onChange={e => setForm(f => ({...f, sku: e.target.value}))} />
            </div>
            {!product && (
              <div className="form-group modal-grid__full">
                <label>Product Images</label>
                <input ref={fileRef} type="file" multiple accept="image/*" className="form-control"
                  onChange={e => setFiles([...e.target.files])} />
                {files.length > 0 && (
                  <div className="file-previews">
                    {files.map((f, i) => (
                      <img key={i} src={URL.createObjectURL(f)} alt={f.name} className="file-preview" />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="modal__footer">
            <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

/* ── Main Seller Dashboard ── */
export default function SellerDashboard() {
  const { user }                       = useAuth();
  const [tab,        setTab]           = useState('overview');
  const [products,   setProducts]      = useState([]);
  const [orders,     setOrders]        = useState([]);
  const [categories, setCategories]    = useState([]);
  const [loading,    setLoading]       = useState(true);
  const [showModal,  setShowModal]     = useState(false);
  const [editProd,   setEditProd]      = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pRes, oRes, cRes] = await Promise.all([
        productAPI.getMyProducts({ limit: 100 }),
        orderAPI.getSellerOrders({ limit: 50 }),
        productAPI.getCategories(),
      ]);
      setProducts(pRes.data.data);
      setOrders(oRes.data.data);
      setCategories(cRes.data.data);
    } catch { toast.error('Failed to load data'); }
    finally  { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const totalRevenue = orders
    .filter(o => o.item_status === 'delivered')
    .reduce((s, o) => s + parseFloat(o.total_price), 0);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await productAPI.delete(id);
      toast.success('Product deleted');
      fetchAll();
    } catch { toast.error('Failed to delete'); }
  };

  const pendingOrders = orders.filter(o => o.item_status === 'pending').length;

  if (!user?.is_approved) {
    return (
      <div className="seller-pending fade-up">
        <Clock size={64} strokeWidth={1.2} style={{ opacity: .3, marginBottom: 16 }} />
        <h2>Account Pending Approval</h2>
        <p>Your seller account is being reviewed by our team. You'll be notified once approved.</p>
      </div>
    );
  }

  return (
    <div className="seller-dashboard fade-up" style={{ paddingTop: 90 }}>
      <div className="container">
        <div className="seller-header">
          <div>
            <h1>Seller Dashboard</h1>
            <p className="seller-header__sub">
              Welcome back, <strong>{user.shop_name || user.name}</strong>
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditProd(null); setShowModal(true); }}>
            + Add Product
          </button>
        </div>

        {/* Tabs */}
        <div className="dash-tabs">
          {['overview', 'products', 'orders'].map(t => (
            <button key={t} className={`dash-tab ${tab === t ? 'dash-tab--active' : ''}`}
              onClick={() => setTab(t)}>
              {{
                overview: <><BarChart2 size={15} strokeWidth={2} /> Overview</>,
                products: <><Package    size={15} strokeWidth={2} /> Products</>,
                orders:   <><ShoppingBag size={15} strokeWidth={2} /> Orders</>
              }[t]}
            </button>
          ))}
        </div>

        {loading ? <div className="spinner" /> : (
          <>
            {/* ── Overview ── */}
            {tab === 'overview' && (
              <div className="seller-overview">
                <div className="stat-cards">
                  <StatCard icon={<Package    size={24} strokeWidth={1.7} />} label="Total Products" value={products.length} />
                  <StatCard icon={<ShoppingBag size={24} strokeWidth={1.7} />} label="Total Orders"   value={orders.length} />
                  <StatCard icon={<Clock       size={24} strokeWidth={1.7} />} label="Pending Orders" value={pendingOrders} />
                  <StatCard icon={<DollarSign  size={24} strokeWidth={1.7} />} label="Revenue"        value={`$${totalRevenue.toFixed(2)}`} sub="Delivered orders" />
                </div>

                {/* Low stock warning */}
                {products.filter(p => p.stock <= 5 && p.stock > 0).length > 0 && (
                  <div className="low-stock-alert">
                    <AlertTriangle size={16} strokeWidth={2} style={{flexShrink:0}} />
                    <strong>Low Stock Alert</strong>
                    <div className="low-stock-items">
                      {products.filter(p => p.stock <= 5 && p.stock > 0).map(p => (
                        <span key={p.id} className="badge badge-orange">{p.name} ({p.stock} left)</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent orders */}
                <div className="dash-section">
                  <h3>Recent Orders</h3>
                  <div className="orders-table">
                    <div className="orders-table__head">
                      <span>Product</span><span>Buyer</span><span>Qty</span>
                      <span>Total</span><span>Status</span><span>Date</span>
                    </div>
                    {orders.slice(0, 8).map((o, i) => (
                      <div key={i} className="orders-table__row">
                        <span className="orders-table__name">{o.product_name}</span>
                        <span>{o.buyer_name}</span>
                        <span>{o.quantity}</span>
                        <span>${parseFloat(o.total_price).toFixed(2)}</span>
                        <span><span className={`badge ${o.item_status === 'delivered' ? 'badge-green' : o.item_status === 'cancelled' ? 'badge-red' : 'badge-orange'}`}>
                          {o.item_status}
                        </span></span>
                        <span>{o.order_date?.slice(0,10)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Products ── */}
            {tab === 'products' && (
              <div className="products-table-wrap">
                {products.length === 0 ? (
                  <div className="products-empty" style={{padding:'60px 0'}}>
                    <Package size={56} strokeWidth={1.2} style={{ opacity: .25, marginBottom: 12 }} />
                    <h3>No products yet</h3>
                    <p>Add your first product to start selling</p>
                    <button className="btn btn-primary" onClick={() => { setEditProd(null); setShowModal(true); }}>
                      + Add Product
                    </button>
                  </div>
                ) : (
                  <div className="products-table">
                    <div className="products-table__head">
                      <span>Product</span><span>Price</span><span>Stock</span>
                      <span>Sales</span><span>Rating</span><span>Status</span><span>Actions</span>
                    </div>
                    {products.map(p => (
                      <div key={p.id} className="products-table__row">
                        <div className="products-table__name">
                          {p.image && <img src={p.image} alt={p.name} className="products-table__thumb" />}
                          <span>{p.name}</span>
                        </div>
                        <span>${parseFloat(p.price).toFixed(2)}</span>
                        <span className={p.stock === 0 ? 'text-danger' : p.stock <= 5 ? 'text-warn' : ''}>
                          {p.stock}
                        </span>
                        <span>{p.sales_count}</span>
                        <span style={{display:'inline-flex',alignItems:'center',gap:4}}>
                          <Star size={12} fill="currentColor" strokeWidth={0} style={{color:'#f59e0b'}} />
                          {parseFloat(p.rating).toFixed(1)}
                        </span>
                        <span>
                          <span className={`badge ${p.is_active ? 'badge-green' : 'badge-gray'}`}>
                            {p.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </span>
                        <div className="products-table__actions">
                          <button className="btn btn-outline btn-sm"
                            onClick={() => { setEditProd(p); setShowModal(true); }}>Edit</button>
                          <button className="btn btn-sm" style={{color:'#c0392b'}}
                            onClick={() => handleDelete(p.id)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Orders ── */}
            {tab === 'orders' && (
              <div className="orders-table-wrap">
                <div className="orders-table">
                  <div className="orders-table__head">
                    <span>Product</span><span>Buyer</span><span>City</span>
                    <span>Qty</span><span>Total</span><span>Payment</span><span>Status</span>
                  </div>
                  {orders.map((o, i) => (
                    <div key={i} className="orders-table__row">
                      <span className="orders-table__name">{o.product_name}</span>
                      <div>
                        <div>{o.buyer_name}</div>
                        <small style={{color:'var(--muted)'}}>{o.buyer_email}</small>
                      </div>
                      <span>{o.shipping_city}</span>
                      <span>{o.quantity}</span>
                      <span>${parseFloat(o.total_price).toFixed(2)}</span>
                      <span className={`badge ${o.payment_status === 'paid' ? 'badge-green' : 'badge-orange'}`}>
                        {o.payment_status}
                      </span>
                      <span className={`badge ${o.item_status === 'delivered' ? 'badge-green' : o.item_status === 'cancelled' ? 'badge-red' : 'badge-orange'}`}>
                        {o.item_status}
                      </span>
                    </div>
                  ))}
                  {!orders.length && (
                    <p style={{textAlign:'center',padding:'40px',color:'var(--muted)'}}>No orders yet</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <ProductModal
          product={editProd}
          categories={categories}
          onClose={() => setShowModal(false)}
          onSaved={fetchAll}
        />
      )}
    </div>
  );
}
