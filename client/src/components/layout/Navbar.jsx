/* components/layout/Navbar.jsx */
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCartStore } from '../../store/cartStore';
import {
  PawPrint, Search, ShoppingBag, ChevronDown,
  LogOut, Menu, X, LayoutDashboard, Package,
  ClipboardList, UserCircle, ShieldCheck
} from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout }          = useAuth();
  const { items, fetchCart }      = useCartStore();
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [dropOpen, setDropOpen]   = useState(false);
  const navigate                  = useNavigate();
  const location                  = useLocation();

  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (user) fetchCart();
  }, [user]);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon"><PawPrint size={26} strokeWidth={2} /></span>
          <span>Pet<strong>Market</strong></span>
        </Link>

        {/* Search bar */}
        <form className="navbar__search" onSubmit={(e) => {
          e.preventDefault();
          const q = e.target.q.value.trim();
          if (q) navigate(`/products?search=${q}`);
        }}>
          <input name="q" placeholder="Search food, toys, accessories…" className="navbar__search-input" />
          <button type="submit" className="navbar__search-btn">
            <Search size={17} strokeWidth={2.3} />
          </button>
        </form>

        {/* Nav Links */}
        <nav className={`navbar__nav ${menuOpen ? 'navbar__nav--open' : ''}`}>
          <Link to="/" className="navbar__link">Shop</Link>
          <Link to="/products?featured=1" className="navbar__link">Featured</Link>

          {!user ? (
            <>
              <Link to="/login"    className="btn btn-outline btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          ) : (
            <>
              {/* Cart */}
              {user.role === 'buyer' && (
                <Link to="/cart" className="navbar__cart">
                  <ShoppingBag size={22} strokeWidth={1.8} />
                  {cartCount > 0 && <span className="navbar__cart-badge">{cartCount}</span>}
                </Link>
              )}

              {/* User dropdown */}
              <div className="navbar__user" onClick={() => setDropOpen(!dropOpen)}>
                <div className="navbar__avatar">
                  {user.avatar
                    ? <img src={user.avatar} alt={user.name} />
                    : <span>{user.name?.[0]?.toUpperCase()}</span>
                  }
                </div>
                <span className="navbar__username">{user.name?.split(' ')[0]}</span>
                <ChevronDown size={14} strokeWidth={2.5} style={{ transition: 'transform .2s', transform: dropOpen ? 'rotate(180deg)' : 'none' }} />

                {dropOpen && (
                  <div className="navbar__dropdown" onClick={e => e.stopPropagation()}>
                    {user.role === 'buyer' && (
                      <>
                        <Link to="/orders"  className="navbar__dropdown-item"><ClipboardList size={15} /> My Orders</Link>
                        <Link to="/profile" className="navbar__dropdown-item"><UserCircle size={15} /> Profile</Link>
                      </>
                    )}
                    {user.role === 'seller' && (
                      <>
                        <Link to="/seller"          className="navbar__dropdown-item"><LayoutDashboard size={15} /> Dashboard</Link>
                        <Link to="/seller/products" className="navbar__dropdown-item"><Package size={15} /> My Products</Link>
                        <Link to="/seller/orders"   className="navbar__dropdown-item"><ClipboardList size={15} /> Orders</Link>
                      </>
                    )}
                    {user.role === 'admin' && (
                      <Link to="/admin" className="navbar__dropdown-item"><ShieldCheck size={15} /> Admin Panel</Link>
                    )}
                    <hr className="navbar__dropdown-divider"/>
                    <button onClick={handleLogout} className="navbar__dropdown-item navbar__dropdown-logout">
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </nav>

        {/* Hamburger */}
        <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  );
}
