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
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <nav className="top-nav">
          <ul>
            <li onClick={() => setActiveTab("dashboard")}>Tableau de bord</li>
            <li onClick={() => setActiveTab("products")}>Produits</li>
            <li onClick={() => setActiveTab("orders")}>Commandes</li>
            <li onClick={() => setActiveTab("users")}>Utilisateurs</li>
            <li onClick={handleLogout}>Se déconnecter</li>
          </ul>
        </nav>
      </header>

      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
