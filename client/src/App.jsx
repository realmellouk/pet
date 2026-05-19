// App.jsx — Root router with lazy loading
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Toaster }        from 'react-hot-toast';

import { AuthProvider }   from './context/AuthContext';
import ProtectedRoute     from './components/common/ProtectedRoute';
import Navbar             from './components/layout/Navbar';
import Footer             from './components/layout/Footer';

// Eager (critical path)
import Home          from './pages/Home';
import Products      from './pages/Products';
import { Login, Register } from './pages/Auth';

// Lazy (split bundles)
const ProductDetail   = lazy(() => import('./pages/ProductDetail'));
const Cart            = lazy(() => import('./pages/Cart'));
const { OrderList, OrderDetail } = { OrderList: lazy(() => import('./pages/Orders').then(m => ({ default: m.OrderList }))), OrderDetail: lazy(() => import('./pages/Orders').then(m => ({ default: m.OrderDetail }))) };
const SellerDashboard = lazy(() => import('./pages/seller/SellerDashboard'));
const AdminDashboard  = lazy(() => import('./pages/admin/AdminDashboard'));

const PageLoader = () => <div className="spinner" style={{ marginTop: 140 }} />;

function Layout() {
  const { pathname } = useLocation();
  // Full-screen pages (no footer)
  const noFooter = ['/login', '/register'].includes(pathname);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/"            element={<Home />} />
            <Route path="/products"    element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/login"       element={<Login />} />
            <Route path="/register"    element={<Register />} />

            {/* Buyer */}
            <Route path="/cart" element={
              <ProtectedRoute roles={['buyer']}>
                <Cart />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute roles={['buyer']}>
                <OrderList />
              </ProtectedRoute>
            } />
            <Route path="/orders/:id" element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            } />

            {/* Seller */}
            <Route path="/seller" element={
              <ProtectedRoute roles={['seller']}>
                <SellerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/seller/products" element={
              <ProtectedRoute roles={['seller']}>
                <SellerDashboard initialTab="products" />
              </ProtectedRoute>
            } />
            <Route path="/seller/orders" element={
              <ProtectedRoute roles={['seller']}>
                <SellerDashboard initialTab="orders" />
              </ProtectedRoute>
            } />

            {/* Admin */}
            <Route path="/admin" element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* 404 */}
            <Route path="*" element={
              <div style={{ textAlign: 'center', padding: '140px 20px' }}>
                <h1 style={{ fontSize: '4rem' }}>404</h1>
                <p style={{ color: 'var(--muted)', marginBottom: 20 }}>Page not found</p>
                <a href="/" className="btn btn-primary">Go Home</a>
              </div>
            } />
          </Routes>
        </Suspense>
      </main>
      {!noFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '12px',
              fontFamily:   'var(--font-body)',
              fontSize:     '0.9rem',
            },
            success: { iconTheme: { primary: 'var(--sage)', secondary: 'white' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
