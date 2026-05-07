/* pages/admin/AdminDashboard.jsx */
import { useState, useEffect } from 'react';
import { adminAPI }            from '../../api/axios';
import {
  Users, Store, Clock, ShoppingBag, DollarSign,
  Package, AlertTriangle, Calendar, BarChart2, Star
} from 'lucide-react';
import toast                   from 'react-hot-toast';
import './Admin.css';

const StatBox = ({ icon, label, value, color }) => (
  <div className="admin-stat" style={{ '--accent-color': color }}>
    <div className="admin-stat__icon">{icon}</div>
    <div className="admin-stat__val">{value ?? '—'}</div>
    <div className="admin-stat__label">{label}</div>
  </div>
);

export default function AdminDashboard() {
  const [tab,      setTab]     = useState('overview');
  const [stats,    setStats]   = useState(null);
  const [users,    setUsers]   = useState([]);
  const [orders,   setOrders]  = useState([]);
  const [products, setProducts]= useState([]);
  const [loading,  setLoading] = useState(true);
  const [search,   setSearch]  = useState('');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [sRes, uRes, oRes, pRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers({ limit: 100 }),
        adminAPI.getOrders({ limit: 100 }),
        adminAPI.getProducts({ limit: 100 }),
      ]);
      setStats(sRes.data.data);
      setUsers(uRes.data.data);
      setOrders(oRes.data.data);
      setProducts(pRes.data.data);
    } catch { toast.error('Failed to load admin data'); }
    finally  { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, []);

  const handleApprove = async (id, approved) => {
    try {
      await adminAPI.approveSeller(id, approved);
      toast.success(approved ? 'Seller approved ✅' : 'Seller rejected');
      loadAll();
    } catch { toast.error('Action failed'); }
  };

  const handleToggleUser = async (id) => {
    try {
      await adminAPI.toggleUser(id);
      toast.success('User status updated');
      loadAll();
    } catch { toast.error('Action failed'); }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Permanently delete this user?')) return;
    try {
      await adminAPI.deleteUser(id);
      toast.success('User deleted');
      loadAll();
    } catch { toast.error('Delete failed'); }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const pendingSellers = users.filter(u => u.role === 'seller' && !u.is_approved);

  return (
    <div className="admin-dashboard fade-up" style={{ paddingTop: 90 }}>
      <div className="container">
        <div className="admin-header">
          <div>
            <h1>Admin Panel</h1>
            <p className="admin-header__sub">Pet Marketplace Management Console</p>
          </div>
          {pendingSellers.length > 0 && (
            <div className="admin-alert">
              <AlertTriangle size={16} strokeWidth={2} style={{flexShrink:0}} />
              <strong>{pendingSellers.length}</strong> seller{pendingSellers.length > 1 ? 's' : ''} awaiting approval
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="dash-tabs">
          {['overview','users','orders','products'].map(t => (
            <button key={t} className={`dash-tab ${tab === t ? 'dash-tab--active' : ''}`}
              onClick={() => setTab(t)}>
              {{
                overview: <><BarChart2   size={15} strokeWidth={2} /> Overview</>,
                users:    <><Users       size={15} strokeWidth={2} /> Users</>,
                orders:   <><ShoppingBag size={15} strokeWidth={2} /> Orders</>,
                products: <><Package     size={15} strokeWidth={2} /> Products</>
              }[t]}
            </button>
          ))}
        </div>

        {loading ? <div className="spinner" /> : (
          <>
            {/* ── Overview ── */}
            {tab === 'overview' && stats && (
              <div>
                <div className="admin-stats-grid">
                  <StatBox icon={<Users        size={26} strokeWidth={1.6} />} label="Total Users"     value={stats.userStats?.total_users}     color="var(--sage)" />
                  <StatBox icon={<Store        size={26} strokeWidth={1.6} />} label="Active Sellers"  value={stats.userStats?.sellers}         color="var(--terracotta)" />
                  <StatBox icon={<Clock        size={26} strokeWidth={1.6} />} label="Pending Sellers" value={stats.userStats?.pending_sellers} color="#e67e22" />
                  <StatBox icon={<ShoppingBag  size={26} strokeWidth={1.6} />} label="Total Orders"    value={stats.orderStats?.total_orders}   color="var(--sage-dark)" />
                  <StatBox icon={<DollarSign   size={26} strokeWidth={1.6} />} label="Total Revenue"   value={`$${parseFloat(stats.orderStats?.total_revenue || 0).toFixed(2)}`} color="#27ae60" />
                  <StatBox icon={<Package      size={26} strokeWidth={1.6} />} label="Total Products"  value={stats.productStats?.total_products} color="#2980b9" />
                  <StatBox icon={<AlertTriangle size={26} strokeWidth={1.6} />} label="Out of Stock"   value={stats.productStats?.out_of_stock} color="#e74c3c" />
                  <StatBox icon={<Calendar     size={26} strokeWidth={1.6} />} label="Orders Today"    value={stats.orderStats?.today_orders}   color="var(--sage)" />
                </div>

                {/* Revenue chart (simple bars) */}
                {stats.revenueChart?.length > 0 && (
                  <div className="admin-chart">
                    <h3>Revenue — Last 7 Days</h3>
                    <div className="chart-bars">
                      {stats.revenueChart.map((d, i) => {
                        const max = Math.max(...stats.revenueChart.map(x => x.revenue));
                        const pct = max ? (d.revenue / max) * 100 : 0;
                        return (
                          <div key={i} className="chart-bar-col">
                            <div className="chart-bar-wrap">
                              <div className="chart-bar" style={{ height: `${pct}%` }}>
                                <span className="chart-bar__tip">${parseFloat(d.revenue).toFixed(0)}</span>
                              </div>
                            </div>
                            <span className="chart-bar__label">{d.date?.slice(5)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Pending sellers */}
                {pendingSellers.length > 0 && (
                  <div className="admin-section">
                    <h3 style={{display:'flex',alignItems:'center',gap:8}}><Clock size={18} strokeWidth={2} /> Pending Seller Approvals</h3>
                    <div className="admin-table">
                      <div className="admin-table__head" style={{gridTemplateColumns:'1fr 1.5fr 1fr 1fr'}}>
                        <span>Name</span><span>Email</span><span>Shop</span><span>Actions</span>
                      </div>
                      {pendingSellers.map(u => (
                        <div key={u.id} className="admin-table__row" style={{gridTemplateColumns:'1fr 1.5fr 1fr 1fr'}}>
                          <span>{u.name}</span>
                          <span style={{fontSize:'.85rem',color:'var(--muted)'}}>{u.email}</span>
                          <span>{u.shop_name}</span>
                          <div style={{display:'flex',gap:8}}>
                            <button className="btn btn-primary btn-sm" onClick={() => handleApprove(u.id, true)}>✓ Approve</button>
                            <button className="btn btn-sm" style={{color:'#c0392b',border:'1px solid #c0392b',borderRadius:'var(--r-full)',padding:'6px 12px'}}
                              onClick={() => handleApprove(u.id, false)}>✕ Reject</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Users ── */}
            {tab === 'users' && (
              <div>
                <div style={{marginBottom:20}}>
                  <input className="form-control" placeholder="Search users by name or email…"
                    value={search} onChange={e => setSearch(e.target.value)}
                    style={{maxWidth:360}} />
                </div>
                <div className="admin-table">
                  <div className="admin-table__head" style={{gridTemplateColumns:'1.5fr 2fr 0.8fr 0.8fr 0.8fr 1.2fr'}}>
                    <span>Name</span><span>Email</span><span>Role</span>
                    <span>Status</span><span>Approved</span><span>Actions</span>
                  </div>
                  {filteredUsers.map(u => (
                    <div key={u.id} className="admin-table__row" style={{gridTemplateColumns:'1.5fr 2fr 0.8fr 0.8fr 0.8fr 1.2fr'}}>
                      <span style={{fontWeight:500}}>{u.name}</span>
                      <span style={{fontSize:'.85rem',color:'var(--muted)'}}>{u.email}</span>
                      <span><span className={`badge ${u.role === 'seller' ? 'badge-orange' : 'badge-green'}`}>{u.role}</span></span>
                      <span><span className={`badge ${u.is_active ? 'badge-green' : 'badge-red'}`}>{u.is_active ? 'Active' : 'Banned'}</span></span>
                      <span>
                        {u.role === 'seller'
                          ? <span className={`badge ${u.is_approved ? 'badge-green' : 'badge-orange'}`}>{u.is_approved ? 'Yes' : 'No'}</span>
                          : <span className="badge badge-gray">N/A</span>
                        }
                      </span>
                      <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                        {u.role === 'seller' && !u.is_approved && (
                          <button className="btn btn-primary btn-sm" onClick={() => handleApprove(u.id, true)}>Approve</button>
                        )}
                        <button className="btn btn-outline btn-sm" onClick={() => handleToggleUser(u.id)}>
                          {u.is_active ? 'Ban' : 'Unban'}
                        </button>
                        <button className="btn btn-sm" style={{color:'#c0392b'}}
                          onClick={() => handleDeleteUser(u.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Orders ── */}
            {tab === 'orders' && (
              <div className="admin-table">
                <div className="admin-table__head" style={{gridTemplateColumns:'0.5fr 1.5fr 1.5fr 1fr 1fr 1fr'}}>
                  <span>ID</span><span>Buyer</span><span>Address</span>
                  <span>Total</span><span>Payment</span><span>Status</span>
                </div>
                {orders.map(o => (
                  <div key={o.id} className="admin-table__row" style={{gridTemplateColumns:'0.5fr 1.5fr 1.5fr 1fr 1fr 1fr'}}>
                    <span style={{fontWeight:600,color:'var(--primary)'}}>#{o.id}</span>
                    <div>
                      <div style={{fontWeight:500}}>{o.buyer_name}</div>
                      <small style={{color:'var(--muted)'}}>{o.buyer_email}</small>
                    </div>
                    <span style={{fontSize:'.85rem'}}>{o.shipping_name}, {o.shipping_city}</span>
                    <span style={{fontWeight:600}}>${parseFloat(o.total_amount).toFixed(2)}</span>
                    <span><span className={`badge ${o.payment_status === 'paid' ? 'badge-green' : 'badge-orange'}`}>{o.payment_status}</span></span>
                    <span><span className={`badge ${o.status === 'delivered' ? 'badge-green' : o.status === 'cancelled' ? 'badge-red' : 'badge-orange'}`}>{o.status}</span></span>
                  </div>
                ))}
              </div>
            )}

            {/* ── Products ── */}
            {tab === 'products' && (
              <div>
                <div style={{marginBottom:20}}>
                  <input className="form-control" placeholder="Search products…"
                    style={{maxWidth:360}} />
                </div>
                <div className="admin-table">
                  <div className="admin-table__head" style={{gridTemplateColumns:'2fr 1fr 1fr 1fr 0.8fr 1fr 0.8fr'}}>
                    <span>Product</span><span>Seller</span><span>Category</span>
                    <span>Price</span><span>Stock</span><span>Status</span><span>Rating</span>
                  </div>
                  {products.map(p => (
                    <div key={p.id} className="admin-table__row" style={{gridTemplateColumns:'2fr 1fr 1fr 1fr 0.8fr 1fr 0.8fr'}}>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        {p.image && <img src={p.image} alt={p.name} style={{width:40,height:40,borderRadius:'var(--r-sm)',objectFit:'cover'}} />}
                        <span style={{fontWeight:500,fontSize:'.9rem'}}>{p.name}</span>
                      </div>
                      <span style={{fontSize:'.85rem'}}>{p.shop_name || p.seller_name}</span>
                      <span style={{fontSize:'.85rem'}}>{p.category_name}</span>
                      <span>${parseFloat(p.price).toFixed(2)}</span>
                      <span className={p.stock === 0 ? 'text-danger' : ''}>{p.stock}</span>
                      <span><span className={`badge ${p.is_active ? 'badge-green' : 'badge-gray'}`}>{p.is_active ? 'Active' : 'Off'}</span></span>
                       <span style={{display:'inline-flex',alignItems:'center',gap:3}}>
                         <Star size={12} fill="currentColor" strokeWidth={0} style={{color:'#f59e0b'}} />
                         {parseFloat(p.rating).toFixed(1)}
                       </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
