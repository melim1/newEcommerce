import React, { useState, useEffect } from 'react';
import "../../styles/Profil.css";
import { FiUser, FiPackage, FiHeart, FiLogOut, FiBell } from "react-icons/fi";
import Footer from '../UI/Footer';
import Header from '../UI/Header';
import api from "../../api";
import ProfilEdit from './ProfilEdit';

const Profil = () => {
  const [activeTab, setActiveTab] = useState("info");
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false); 
  const [commandes, setCommandes] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [wishlist, setWishlist] = useState([]);

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
      api.get("commandes/")
        .then((res) => setCommandes(res.data))
        .catch((err) => console.error("Erreur récupération commandes", err));
    }

    if (activeTab === "wishlist") {
      api.get("/wishlist/")
        .then((res) => setWishlist(res.data))
        .catch((err) => console.error("Erreur récupération wishlist", err));
    }

    if (activeTab === "notifications") {
      api.get("/notifications/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      .then((res) => {
        setNotifications(res.data);
        const unread = res.data.filter(notif => !notif.is_read).length;
        setUnreadCount(unread);
      })
      .catch((err) => {
        console.error("Erreur lors de la récupération des notifications", err);
      });
    }

  }, [activeTab]);

  const handleMarkAsRead = (notifId) => {
    api.post(`/notifications/${notifId}/mark_as_read/`, null, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
    .then(() => {
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notifId ? { ...notification, is_read: true } : notification
        )
      );
      setUnreadCount(prev => prev - 1);
    })
    .catch((err) => {
      console.error("Erreur lors du marquage de la notification", err);
    });
  };

  const handleClickNotificationsTab = () => {
    setUnreadCount(0);
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, is_read: true }))
    );
  };

  const handleUpdate = (updatedData) => {
    setUserInfo(updatedData);
    setIsEditing(false);
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
              <FiUser className="icon" />  Informations personnelles 
            </li>
            <li className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}>
              <FiPackage className="icon" /> Mes commandes
            </li>
            <li className={activeTab === "wishlist" ? "active" : ""} onClick={() => setActiveTab("wishlist")}>
              <FiHeart className="icon" /> Favoris
            </li>
            <li 
              className={activeTab === "notifications" ? "active" : ""} 
              onClick={() => { 
                setActiveTab("notifications"); 
                handleClickNotificationsTab();
              }}
            >
              <FiBell className="icon" /> Notifications 
              {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
            </li>
            <li className="logout">
              <FiLogOut className="icon" /> Déconnexion
            </li>
          </ul>
        </aside>

        <main className="profile-content">
          {activeTab === "orders" ? (
            <>
              <h1 className="titre">Mes commandes</h1>
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
          ) : activeTab === "wishlist" ? (
            <>
              <h1 className="titre">Mes favoris</h1>
          <div className="wishlist">
            {wishlist.length === 0 ? (
              <p>Votre wishlist est vide.</p>
            ) : (
              <div className="wishlist-items">
                {wishlist.map((item) => (
                  <div key={item.id} className="wishlist-card">
                    <img
                      src={`http://localhost:8000${item.product.image}`} 
                      alt={item.product.name}
                      className="wishlist-product-image"
                    />
                    <div className="wishlist-product-info">
                      <h3>{item.product.name}</h3>
                     </div>
                     
                     

                      <div className="wishlist-product-inf">
                      <p>{item.product.price}$</p>
                     
                   
                    </div>

                    <div className='wishlist-buttons'>
                       
                    <button
                        className="voir-details-button"
                        onClick={() => window.location.href = `/product/${item.product.slug}`}
                      >
                        Voir le produit
                      </button>

                      </div>
                  </div>
                ))}
              </div>
            )}
          </div>

            </>
          ) : activeTab === "notifications" ? (
            <>
              <h1 className="titre">Mes Notifications</h1>
              <div className="notifications">
                {notifications.length === 0 ? (
                  <p>Vous n'avez aucune notification.</p>
                ) : (
                  <ul className="notification-list">
                    {notifications.map((notif) => (
                      <li 
                        key={notif.id} 
                        className={`notification-item ${notif.is_read ? 'read' : ''}`}
                        onClick={() => handleMarkAsRead(notif.id)}
                      >
                        <div className="message">{notif.message}</div>
                        <div className="date">{new Date(notif.dateEnvoi).toLocaleString()}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          ) : (
            <>
              <h1 className="titre"> Informations personnelles </h1>
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
