/* pages/Login.jsx */
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export function Login() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from       = location.state?.from || '/';
  const [form, setForm]     = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.name}! 🐾`);
      if      (user.role === 'admin')  navigate('/admin');
      else if (user.role === 'seller') navigate('/seller');
      else                             navigate(from);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page fade-up">
      <div className="auth-card">
        <div className="auth-card__brand">
          <span className="auth-card__paw">🐾</span>
          <h1>Welcome Back</h1>
          <p>Sign in to your PetMarket account</p>
        </div>

        <form onSubmit={handle} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" className="form-control" placeholder="you@example.com"
              value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" className="form-control" placeholder="••••••••"
              value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} required />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="auth-card__footer">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>

        {/* Demo accounts */}
        <div className="auth-demo">
          <p>Demo accounts:</p>
          <code>admin@petmarket.com / Admin@123</code>
        </div>
      </div>

      <div className="auth-visual">
        <img src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=700&q=80"
          alt="Happy dog" />
        <div className="auth-visual__overlay">
          <blockquote>"The best things in life have fur."</blockquote>
        </div>
      </div>
    </div>
  );
}

/* pages/Register.jsx */
export function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm]     = useState({ name: '', email: '', password: '', role: 'buyer', shop_name: '' });
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast.success('Account created! 🎉');
      if      (user.role === 'seller') navigate('/seller');
      else                             navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page fade-up">
      <div className="auth-card">
        <div className="auth-card__brand">
          <span className="auth-card__paw">🐾</span>
          <h1>Create Account</h1>
          <p>Join thousands of pet lovers</p>
        </div>

        <form onSubmit={handle} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" className="form-control" placeholder="John Doe"
              value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" className="form-control" placeholder="you@example.com"
              value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" className="form-control" placeholder="Min 6 characters"
              value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} required minLength={6} />
          </div>

          {/* Role toggle */}
          <div className="role-toggle">
            <button type="button"
              className={`role-toggle__btn ${form.role === 'buyer' ? 'role-toggle__btn--active' : ''}`}
              onClick={() => setForm(f => ({...f, role: 'buyer', shop_name: ''}))}>
              🛒 I'm a Buyer
            </button>
            <button type="button"
              className={`role-toggle__btn ${form.role === 'seller' ? 'role-toggle__btn--active' : ''}`}
              onClick={() => setForm(f => ({...f, role: 'seller'}))}>
              🏪 I'm a Seller
            </button>
          </div>

          {form.role === 'seller' && (
            <div className="form-group fade-up">
              <label>Shop Name</label>
              <input type="text" className="form-control" placeholder="My Pet Store"
                value={form.shop_name}
                onChange={e => setForm(f => ({...f, shop_name: e.target.value}))} required />
              <small style={{color:'var(--muted)', fontSize:'.8rem'}}>
                ⏳ Your seller account will need admin approval before you can list products.
              </small>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-card__footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>

      <div className="auth-visual">
        <img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=700&q=80"
          alt="Happy cat" />
        <div className="auth-visual__overlay">
          <blockquote>"Every pet deserves the best."</blockquote>
        </div>
      </div>
    </div>
  );
}
