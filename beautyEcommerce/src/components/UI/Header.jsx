import React, { useState } from 'react';
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import {RiHeartAdd2Fill} from 'react-icons/ri';

import { Link } from 'react-router-dom';
import "../../styles/Header.css";

const Header = ({ toggleSidebar }) => {
  const [showDialog, setShowDialog] = useState(false);

  const handleOpenDialog = () => setShowDialog(true);
  const handleCloseDialog = () => setShowDialog(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Traite le formulaire ici
    console.log("Formulaire soumis !");
    handleCloseDialog();
  };

  return (
    <>
      <header className="header">
        <div className="menu-icon" onClick={toggleSidebar}>
          ☰
        </div>
        <h1 className="logo">Touché Beauty</h1>
        
        <div className="header-icons">
        
          <Link to="/AddProduct" className="add-button">
          <RiHeartAdd2Fill color='black' size={24}/>
          </Link>
          <Link to="/cart" className="cart-icon">
            <FaShoppingCart />
          </Link>
          <Link to="/profil" className="profile-icon">
            <FaUser />
          </Link>
        </div>
      </header>

    </>
  );
};

export default Header;
