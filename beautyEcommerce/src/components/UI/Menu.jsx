import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaShoppingBag, FaSignInAlt, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';

import { useNavigate } from 'react-router-dom';
import "../../styles/Menu.css";

const Menu = ({ isSidebarOpen, toggleSidebar }) => {
  const [showProduits, setShowProduits] = useState(false);
  const isAuthenticated = localStorage.getItem("access_token");
   const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
  };

  const toggleProduits = () => {
    setShowProduits(!showProduits);
  };
   const goToCategory = (category) => {
    navigate(`/categorie?category=${category}`);
    toggleSidebar(); // pour fermer le menu après clic
  };


  return (
    <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>Menu</h2>
        <button className="close-btn" onClick={toggleSidebar}>
          &times;
        </button>
      </div>

      <ul className="sidebar-links">
        <li>
          <Link to="/"><FaHome className="icon" />  <span>Accueil</span></Link>
        </li>

        <li className="link-style" onClick={toggleProduits}>
          <FaShoppingBag className="icon" />
          Produits {showProduits ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
        </li>
        {showProduits && (
          <>
           <li onClick={() => goToCategory('Yeux')}>
          
          <span>Yeux</span>
        </li>
          <li onClick={() => goToCategory('Teint')}>
         
          <span>Teint</span>
        </li>
        <li onClick={() => goToCategory('Lèvres')}>
       
          <span>Lèvres</span>
        </li>
          </>
        )}

        {!isAuthenticated ? (
          <li><Link to="/login"><FaSignInAlt className="icon" />   <span>Se connecter</span></Link></li>
        ) : (
          <>
            <li><Link to="/profil"><FaUser className="icon" /><span> Mon Profil </span></Link></li>
            <li><a href="#" onClick={handleLogout}><FaSignOutAlt className="icon" /><span> Déconnexion</span> </a></li>
          </>
        )}
      </ul>
    </aside>
  );
};

export default Menu;
