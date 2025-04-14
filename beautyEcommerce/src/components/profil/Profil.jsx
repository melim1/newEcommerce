import React, { useState, useEffect } from 'react';
import "../../styles/Profil.css";
import { FiUser, FiPackage, FiHeart, FiLogOut } from "react-icons/fi";
import Footer from '../UI/Footer';
import Header from '../UI/Header';
import api from "../../api";
import ProfilEdit from './ProfilEdit'; // Import du composant ProfilEdit

const Profil = () => {
  const [activeTab, setActiveTab] = useState("info");
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false); 
  const [commandes, setCommandes] = useState([]);


  useEffect(() => {
    setLoading(true);
    api.get("user_info/")
      .then(res => {
        setUserInfo(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.log(err.message);
        setLoading(false);
      });
  }, []);
  useEffect(() => {
    if (activeTab === "orders") {
      api.get("/commandes/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      .then((res) => {
        setCommandes(res.data);
      })
      .catch((err) => {
        console.error("Erreur lors de la récupération des commandes", err);
      });
    }
  }, [activeTab]);
  

  const handleUpdate = (updatedData) => {
    setUserInfo(updatedData); // Met à jour les informations de l'utilisateur
    setIsEditing(false); // Passe en mode lecture après l'édition
  };

  return (
    <>
      <Header />
      <div className="profile-container">
        <aside className="profile-sidebar">
          <div className="profile-header">
            <h2 className="profile-name">{userInfo.name}</h2>
          </div>
          <ul className="profile-menu">
            <li className={activeTab === "info" ? "active" : ""} onClick={() => setActiveTab("info")}>
              <FiUser className="icon" /> Personal Info
            </li>
            <li className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}>
              <FiPackage className="icon" /> My Orders
            </li>
            <li className={activeTab === "wishlist" ? "active" : ""} onClick={() => setActiveTab("wishlist")}>
              <FiHeart className="icon" /> Wishlist
            </li>
            <li className="logout">
              <FiLogOut className="icon" /> Log Out
            </li>
          </ul>
        </aside>

        <main className="profile-content">
          {activeTab === "orders" ? (
            <>
            <h1 className="titre">My Orders</h1>
            <div className="orders">
              {commandes.length === 0 ? (
                <p>Vous n'avez pas encore passé de commande.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>ORDER</th>
                      <th>DATE</th>
                      <th>COST</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commandes.map((commande) => (
                      <tr key={commande.id}>
                        <td>#{commande.id}</td>
                        <td>{new Date(commande.dateCommande).toLocaleDateString()}</td>
                        <td>${Number(commande.montantTotal).toFixed(2)}</td>
                        <td>{commande.statut}</td>
                        <td>
                        <button className="details-button" onClick={() => window.location.href = `/commande/${commande.id}`}>
                          Voir détails
                        </button>
                        </td>
                        
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
          
          ) : (
            <>
              <h1 className="titre">Personal Info</h1>
              {!isEditing ? (
                <div>
                  <div className="form-group">
                    <label>Email address*</label>
                    <input type="email" value={userInfo?.email || ''} disabled />
                  </div>
                  <div className="form-group">
                    <label>First Name*</label>
                    <input type="text" value={userInfo?.nom || ''} disabled />
                  </div>
                  <div className="form-group">
                    <label>Last Name*</label>
                    <input type="text" value={userInfo?.prenom || ''} disabled />
                  </div>
                  <div className="form-group">
                    <label>Téléphone*</label>
                    <input type="text" value={userInfo?.tel || ''} disabled />
                  </div>
                  <button type="button" onClick={() => setIsEditing(true)} className="save-changes-btn">
                    Modifier mes informations
                  </button>
                </div>
              ) : (
                <ProfilEdit userInfo={userInfo} onUpdate={handleUpdate} />
              )}
            </>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
};

export default Profil;
