import React, { useState } from 'react';
import { FaShoppingCart, FaUser, FaBars } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import "../../styles/Header.css";

const Header = ({ toggleSidebar }) => {
  const [showDialog, setShowDialog] = useState(false);
  const navigate = useNavigate();

  const isAuthenticated = !!localStorage.getItem('access_token');


  const handleProfileClick = () => {
    if (isAuthenticated) {
      navigate('/profil');
    } else {
      navigate('/login');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Formulaire soumis !");
    handleCloseDialog();
  };

  return (
    <header className="header">
      <div className="menu-icon" onClick={toggleSidebar}>
        <FaBars size={24} />
      </div>

      <h1 className="logo">Touché Beauty</h1>

      <div className="header-icons">
        <Link to="/cart" className="cart-icon">
          <FaShoppingCart />
        </Link>

        {/* ✅ Remplace le Link vers /profil par un clic contrôlé */}
        <div className="profile-icon" onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
          <FaUser />
        </div>
      </div>
    </header>
  );
};

export default Header;
