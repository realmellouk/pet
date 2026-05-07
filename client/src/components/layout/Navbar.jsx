/* components/layout/Navbar.jsx */
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCartStore } from '../../store/cartStore';
import './Navbar.css';

const PawIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M12 13.5c-2.5 0-4.5 2-4.5 4.5S9.5 22.5 12 22.5s4.5-2 4.5-4.5-2-4.5-4.5-4.5z"
      fill="currentColor" opacity=".9"/>
    <circle cx="5.5" cy="10" r="2.5" fill="currentColor" opacity=".7"/>
    <circle cx="18.5" cy="10" r="2.5" fill="currentColor" opacity=".7"/>
    <circle cx="8.5" cy="6" r="2" fill="currentColor" opacity=".6"/>
    <circle cx="15.5" cy="6" r="2" fill="currentColor" opacity=".6"/>
  </svg>
);

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
          <span className="navbar__logo-icon"><PawIcon /></span>
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        </form>

        {/* Nav Links */}
        <nav className={`navbar__nav ${menuOpen ? 'navbar__nav--open' : ''}`}>
          <Link to="/products" className="navbar__link">Shop</Link>
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
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 01-8 0"/>
                  </svg>
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>

                {dropOpen && (
                  <div className="navbar__dropdown" onClick={e => e.stopPropagation()}>
                    {user.role === 'buyer' && (
                      <>
                        <Link to="/orders"  className="navbar__dropdown-item">My Orders</Link>
                        <Link to="/profile" className="navbar__dropdown-item">Profile</Link>
                      </>
                    )}
                    {user.role === 'seller' && (
                      <>
                        <Link to="/seller"         className="navbar__dropdown-item">Dashboard</Link>
                        <Link to="/seller/products" className="navbar__dropdown-item">My Products</Link>
                        <Link to="/seller/orders"   className="navbar__dropdown-item">Orders</Link>
                      </>
                    )}
                    {user.role === 'admin' && (
                      <Link to="/admin" className="navbar__dropdown-item">Admin Panel</Link>
                    )}
                    <hr className="navbar__dropdown-divider"/>
                    <button onClick={handleLogout} className="navbar__dropdown-item navbar__dropdown-logout">
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </nav>

        {/* Hamburger */}
        <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}
