import React, { useState } from 'react';
import GestionProduit from '../AdminFunction/GestionProduit';
import GestionClient from '../AdminFunction/GestionClient';
import GestionCommande from '../AdminFunction/GestionCommande';
import DashboardOverview from '../AdminFunction/DashboardOverview';
import "../../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />;
      case "products":
        return <GestionProduit />;
      case "orders":
        return <GestionCommande />;
      case "users":
        return <GestionClient />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard white-background">
      <header className="admin-header">
        <div className="admin-title">Admin Dashboard</div>
        <nav className="top-nav">
  <button
    className={`nav-btn ${activeTab === "dashboard" ? "active" : ""}`}
    onClick={() => setActiveTab("dashboard")}
  >
    <img src="/icons/dashboard.svg" alt="Dashboard" />
    Tableau de bord
  </button>

  <button
    className={`nav-btn ${activeTab === "products" ? "active" : ""}`}
    onClick={() => setActiveTab("products")}
  >
    <img src="/icons/products.svg" alt="Produits" />
    Produits
  </button>

  <button
    className={`nav-btn ${activeTab === "orders" ? "active" : ""}`}
    onClick={() => setActiveTab("orders")}
  >
    <img src="/icons/orders.svg" alt="Commandes" />
    Commandes
  </button>

  <button
    className={`nav-btn ${activeTab === "users" ? "active" : ""}`}
    onClick={() => setActiveTab("users")}
  >
    <img src="/icons/users.svg" alt="Utilisateurs" />
    Utilisateurs
  </button>

  <button className="nav-btn logout" onClick={handleLogout}>
    <img src="/icons/logout.svg" alt="Déconnexion" />
    Se déconnecter
  </button>
</nav>

      </header>

      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
