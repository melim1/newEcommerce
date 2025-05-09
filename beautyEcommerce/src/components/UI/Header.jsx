import React from 'react';
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import "../../styles/Header.css";

const Header = ({ toggleSidebar }) => {
  return (
   
    <header className="header">
      <div className="menu-icon" onClick={toggleSidebar}>
        ☰
      </div>
      <img src="/images/logo2.png" alt="Logo" className="logo2" />
      
      {/* Conteneur pour les icônes */}
      <div className="header-icons">
        <Link to="/cart" className="cart-icon">
          <FaShoppingCart />
        </Link>
        <Link to="/profil" className="profile-icon">
          <FaUser />
        </Link>
      </div>
      
    </header>
    
  );
};

export default Header;
