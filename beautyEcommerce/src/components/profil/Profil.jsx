import React, { useState, useEffect } from 'react';
import "../../styles/Profil.css";
import { FiUser, FiPackage, FiHeart, FiLogOut, FiBell } from "react-icons/fi";
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
import { AiFillAppstore } from "react-icons/ai";
import { Link, useNavigate } from 'react-router-dom';

import Header from '../UI/Header';
import Footer from '../UI/Footer';
import Menu from '../UI/Menu';
import api from "../../api";
import ProfilEdit from './ProfilEdit';

const Profil = () => {
  const [activeTab, setActiveTab] = useState("info");
  const [userInfo, setUserInfo] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [commandes, setCommandes] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mesProduits, setMesProduits] = useState([]);
  const [productForm, setProductForm] = useState({
    id: null,
    name: '',
    description: '',
    price: '',
    category: '',
    stockDisponible: '',
    ingredient: '',
    image: null,
    image_url: ''
  });
  const [editingProduct, setEditingProduct] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    api.get("user_info/")
      .then(res => setUserInfo(res.data))
      .catch(err => console.log(err));
  }, []);

  useEffect(() => {
    if (activeTab === "orders") {
      api.get("commandes/").then(res => setCommandes(res.data));
    }
    if (activeTab === "wishlist") {
      api.get("/wishlist/").then(res => setWishlist(res.data));
    }
    if (activeTab === "notifications") {
      api.get("/notifications/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      }).then(res => {
        setNotifications(res.data);
        setUnreadCount(res.data.filter(n => !n.is_read).length);
      });
    }
    if (activeTab === "addproduct") {
      fetchProduits();
    }
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  const handleMarkAsRead = (id) => {
    api.post(`/notifications/${id}/mark_as_read/`, null, {
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
    }).then(() => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => prev - 1);
    });
  };

  const fetchProduits = () => {
    api.get("/product/", {
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
    }).then(res => setMesProduits(res.data));
  };

  const handleDelete = async (id) => {
    await api.delete(`/produits/${id}/supprimer/`);
    alert('Produit supprimé');
    fetchProduits();
  };

  const handleEditProduct = (produit) => {
    setProductForm({
      id: produit.id,
      name: produit.name,
      description: produit.description,
      price: produit.price,
      category: produit.category,
      stockDisponible: produit.stockDisponible,
      ingredient: produit.ingredient,
      image: null,
      image_url: produit.image,
    });
    setEditingProduct(true);
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProductForm(prev => ({ ...prev, image: file }));
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (let key in productForm) {
      if (key !== 'image_url') formData.append(key, productForm[key]);
    }

    await api.put(`/produits/${productForm.id}/modifier/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    alert('Produit modifié');
    setEditingProduct(false);
    fetchProduits();
  };

  const renderContent = () => {
    switch (activeTab) {
      case "info":
        return isEditing ? (
          <ProfilEdit userInfo={userInfo} onUpdate={data => { setUserInfo(data); setIsEditing(false); }} />
        ) : (
          <div className="personal-info-container">
            <h2 className="personal-info-title">Mes informations</h2>
            <div className="personal-info-form">
              <div className="form-group"><label>Nom :</label><div>{userInfo.nom}</div></div>
              <div className="form-group"><label>Prénom :</label><div>{userInfo.prenom}</div></div>
              <div className="form-group"><label>Email :</label><div>{userInfo.email}</div></div>
              <div className="form-group"><label>Téléphone :</label><div>{userInfo.tel}</div></div>
              
            </div>
            <button className="save-changes-btn" onClick={() => setIsEditing(true)}>Modifier</button>
          </div>
        );
      case "orders":
        return (
          <div className="orders">
            <h2 className="titre">Mes commandes</h2>
            <table>
              <thead>
                <tr><th>ID</th><th>Date</th><th>Statut</th><th>Détails</th></tr>
              </thead>
              <tbody>
                {commandes.map(c => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.date_commande}</td>
                    <td>{c.status}</td>
                    <td><button className="details-button">Voir</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case "wishlist":
        return (
          <div className="wishlist">
            <h2>Ma Wishlist</h2>
            <div className="wishlist-items">
              {wishlist.map(p => (
                <div className="wishlist-card" key={p.id}>
                  <img src={p.image} alt={p.name} className="wishlist-product-image" />
                  <div className="wishlist-product-info">
                    <h3>{p.name}</h3>
                    <p>{p.price} €</p>
                  </div>
                  <Link to={`/product/${p.slug}`} className="voir-details-button">Voir le produit</Link>
                </div>
              ))}
            </div>
          </div>
        );
      case "notifications":
        return (
          <div className="notifications">
            <h2>Mes notifications</h2>
            <ul className="notification-list">
              {notifications.map(n => (
                <li key={n.id} className={`notification-item ${n.is_read ? 'read' : ''}`}>
                  <div className="message">{n.message}</div>
                  <div className="date">{n.created_at}</div>
                  {!n.is_read && <button onClick={() => handleMarkAsRead(n.id)}>Marquer comme lue</button>}
                </li>
              ))}
            </ul>
          </div>
        );
      case "addproduct":
        return (
          <div className="orders">
            <h2>Mes Produits</h2>
            <table>
              <thead><tr><th>Nom</th><th>Prix</th><th>Actions</th></tr></thead>
              <tbody>
                {mesProduits.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.price} €</td>
                    <td>
                      <button onClick={() => handleEditProduct(p)}><AiFillEdit /></button>
                      <button onClick={() => handleDelete(p.id)}><AiFillDelete /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {editingProduct && (
              <form onSubmit={handleProductSubmit}>
                <input name="name" value={productForm.name} onChange={handleProductChange} placeholder="Nom" />
                <input name="price" value={productForm.price} onChange={handleProductChange} placeholder="Prix" />
                <input name="stockDisponible" value={productForm.stockDisponible} onChange={handleProductChange} placeholder="Stock" />
                <input name="ingredient" value={productForm.ingredient} onChange={handleProductChange} placeholder="Ingrédients" />
                <input type="file" onChange={handleFileChange} />
                <button className="save-changes-btn" type="submit">Enregistrer</button>
              </form>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="profile-header">
           
            <h3 className="profile-name">{userInfo.nom} {userInfo.prenom}</h3>
          </div>
          <ul className="profile-menu">
            <li onClick={() => setActiveTab("info")} className={activeTab === "info" ? "active" : ""}><FiUser className="icon" /> Infos personnelles</li>
            <li onClick={() => setActiveTab("orders")} className={activeTab === "orders" ? "active" : ""}><FiPackage className="icon" /> Commandes</li>
            <li onClick={() => setActiveTab("wishlist")} className={activeTab === "wishlist" ? "active" : ""}><FiHeart className="icon" /> Wishlist</li>
            <li onClick={() => setActiveTab("notifications")} className={activeTab === "notifications" ? "active" : ""}>
              <FiBell className="icon" /> Notifications
              {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
            </li>
            <li onClick={() => setActiveTab("addproduct")} className={activeTab === "addproduct" ? "active" : ""}><AiFillAppstore className="icon" /> Mes Produits</li>
            <li onClick={handleLogout}><FiLogOut className="icon" /> Déconnexion</li>
          </ul>
        </div>
        <div className="profile-content">
          {renderContent()}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profil;
