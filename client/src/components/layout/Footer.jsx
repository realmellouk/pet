/* components/layout/Footer.jsx */
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <div className="footer__logo">🐾 Pet<strong>Market</strong></div>
            <p>The trusted marketplace for all your pet needs. Quality products from verified sellers.</p>
            <div className="footer__socials">
              <a href="#" aria-label="Facebook">📘</a>
              <a href="#" aria-label="Instagram">📸</a>
              <a href="#" aria-label="Twitter">🐦</a>
            </div>
          </div>

          {/* Shop */}
          <div className="footer__col">
            <h4>Shop</h4>
            <Link to="/products">All Products</Link>
            <Link to="/products?pet_type=dog">Dog Supplies</Link>
            <Link to="/products?pet_type=cat">Cat Supplies</Link>
            <Link to="/products?featured=1">Featured</Link>
          </div>

          {/* Sellers */}
          <div className="footer__col">
            <h4>Sellers</h4>
            <Link to="/register">Become a Seller</Link>
            <Link to="/seller">Seller Dashboard</Link>
            <Link to="/login">Seller Login</Link>
          </div>

          {/* Support */}
          <div className="footer__col">
            <h4>Support</h4>
            <a href="#">Help Center</a>
            <a href="#">Shipping Policy</a>
            <a href="#">Returns</a>
            <a href="#">Contact Us</a>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {new Date().getFullYear()} PetMarket. Built with ❤️ for pets everywhere.</p>
          <div className="footer__legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
