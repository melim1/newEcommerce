import React from 'react';
import "../../styles/Footer.css";
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="newsletter">
        
        <div className="newsletter-inputs">
          <input type="text" placeholder="Name" />
          <input type="email" placeholder="Email address" />
          <button>→</button>
        </div>
      </div>

      <div className="footer-content">
        <nav>
          <Link to="/">HOME</Link>
          <Link to="/shop">SHOP</Link>
          <Link to="/about">ABOUT</Link>
          <Link to="/contact">CONTACT</Link>
          <Link to="/stockists">STOCKISTS</Link>
          <Link to="/site-credit">SITE CREDIT</Link>
          <Link to="/follow">FOLLOW ALONG</Link>
        </nav>

        <div className="footer-logo">
          <h1>
            Touché <span>Beauty</span>
          </h1>
        </div>
      </div>

      <div className="copyright">
        <p>Copyright Touché 2022 - By Envol Agency</p>
      </div>
    </footer>
  );
}

export default Footer;
