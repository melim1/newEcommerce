import React from 'react';
import "../../styles/Menu.css";


const Menu = ({ isSidebarOpen, toggleSidebar }) => {
  
  const isAuthenticated = localStorage.getItem("access_token");

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";  // Redirige vers la page de connexion après la déconnexion
  };

  return (
    <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      {/* Sidebar */}
      <div className="sidebar-header">
        <h2>Menu</h2>
        <button className="close-btn" onClick={toggleSidebar}>
          &times;
        </button>
      </div>
      <ul className="sidebar-links">
        <li>
          <a href="/">Home</a>
        </li>
        <li>
          <a href="/shop">Faire mes achats</a>
        </li>
        <li>
          <a href="/about">À propos</a>
        </li>
        <li>
          <a href="/contact">Contact</a>
        </li>

        {/* Si l'utilisateur n'est pas connecté, afficher "S'inscrire" et "Se connecter" */}
        {!isAuthenticated ? (
          <>
            <li>
              <a href="/register">S'inscrire</a>
            </li>
            <li>
              <a href="/login">Se connecter</a>
            </li>
          </>
        ) : (
          // Si l'utilisateur est connecté, afficher "Déconnexion"
          <li>
            <a href="#" onClick={handleLogout}>Déconnexion</a>
          </li>
        )}
      </ul>
    </aside>
  );
};

export default Menu;
