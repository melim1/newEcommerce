import React from 'react';
import "../../styles/Footer.css";
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <nav className="footer-nav">
          <Link to="/">Accueil</Link>
          <Link to="/categorie?category=Yeux">Yeux</Link>
          <Link to="/categorie?category=Teint">Teint</Link>
          <Link to="/categorie?category=Lèvres">Lèvres</Link>
          <Link to="/profil">Mon Profil</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/login">Se connecter</Link>
        </nav>

       
          <img src="/images/logo2.png" alt="Logo" className="logo2" />
        
      </div>

      <div className="copyright">
        <p>© IGLAM 2022 - By Envol Agency</p>
      </div>
    </footer>
  );
}

export default Footer;
