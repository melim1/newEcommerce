
import React, { useState, useEffect } from 'react';
import "../../styles/Profil.css";
import { FiUser, FiPackage, FiHeart, FiLogOut, FiBell } from "react-icons/fi";
import { AiFillProduct, AiFillDelete, AiFillEdit } from "react-icons/ai";
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import { RiHeartAdd2Fill } from 'react-icons/ri';
import { LuPackageCheck } from "react-icons/lu";
import { MdOutlineDisplaySettings } from "react-icons/md";
import { AiFillShop } from "react-icons/ai";

import { Link } from 'react-router-dom';
import Footer from '../UI/Footer';
import Header from '../UI/Header';
import api from "../../api";
import Menu from '../UI/Menu';
import { useNavigate } from "react-router-dom";
import ProfilEdit from './ProfilEdit';

const Profil = () => {

  const [notifications , setNotifications]= useState([]);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [commandes, setCommandes] = useState([]);
  const [mesProduits, setMesProduits] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [erreur, setErreur] = useState('');
  const [wishlist, setWishlist] = useState([]);
  const [boutiqueOpen, setBoutiqueOpen] = useState(false); // état pour ouvrir/fermer sous-menu "Créer ma boutique"



  // État pour la modification de produit
  const [productForm, setProductForm] = useState({
    id: null,
    name: '',
    description: '',
    price: '',
    category: '',
    stockDisponible: '',
    ingredient: '',
    image: null,
    image_url: '',
  });
  const [editingProduct, setEditingProduct] = useState(false);





  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
  };

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
      fetchNotifications();
    }

  }, [activeTab]);
  const fetchNotifications = async () => {
    setLoadingNotif(true);
    try {
      const response = await api.get('/usernotifications/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access')}`,
        },
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setLoadingNotif(false);
    }
  };

  const fetchProduits = () => {
    api.get("/product/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((res) => {
        setMesProduits(res.data);
      })
      .catch((err) => {
        console.error("Erreur lors de la récupération des produits", err);
      });
  };
   useEffect(() => {
    if (activeTab === "addproduct") {
      fetchProduits();
    }
  }, [activeTab]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/produits/${id}/supprimer/`);
      alert('Produit supprimé avec succès');
      fetchProduits();
    } catch (error) {
      console.error('Erreur lors de la suppression du produit', error);
    }
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductForm(prev => ({
        ...prev,
        image: file
      }));
    }
  };


 

 
 useEffect(() => {
    api.get('api/client/commandes/')
      .then(res => {
        console.log("Réponse commandes :", res.data); 
        setCommandes(res.data);
        setLoading(false);
      })
      .catch(err => {
        setErreur("Erreur lors du chargement des commandes");
        setLoading(false);
      });
  }, [activeTab]);
  useEffect(() => {
  if (activeTab === "notifications" && userInfo?.id && userInfo?.role === "client") {
    api.get("/notifications/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`
      }
    })
    .then(res => {
      // Ne garder que les notifications du client connecté
      const clientNotifs = res.data.filter(notif => notif.utilisateur === userInfo.id);
      setNotifications(clientNotifs);
    })
    .catch(err => {
      console.error("Erreur lors de la récupération des notifications", err);
    });
  }
}, [activeTab, userInfo]);

  const changerStatut = (commandeId, nouveauStatut) => {
    api.patch(`api/client/commandes/${commandeId}/status/`, { statut: nouveauStatut })
      .then(res => {
        // Met à jour localement le statut
        setCommandes(prev =>
          prev.map(cmd =>
            cmd.id === commandeId ? { ...cmd, statut: nouveauStatut } : cmd
          )
        );
      })
      .catch(err => {
        setErreur("Erreur lors de la mise à jour du statut");
      });
  };


  if (loading) return <p>Chargement des commandes...</p>;
  if (erreur) return <p style={{ color: 'red' }}>{erreur}</p>;
  
  const handleProductSubmit = async (e) => {
    e.preventDefault();

    if (!editingProduct) return;

    const formData = new FormData();
    formData.append("name", productForm.name);
    formData.append("description", productForm.description);
    formData.append("price", productForm.price);
    formData.append("category", productForm.category);
    formData.append("stockDisponible", productForm.stockDisponible);
    formData.append("ingredient", productForm.ingredient);

    if (productForm.image instanceof File) {
      formData.append("image", productForm.image);
    }

    try {
      await api.put(`/produits/${productForm.id}/modifier/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Produit modifié avec succès');

      setProductForm({
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
      setEditingProduct(false);
      fetchProduits();
    } catch (error) {
      console.error('Erreur lors de la modification du produit', error);
      alert("Erreur : " + (error.response?.data?.detail || error.message));
    }
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

  const handleUpdate = (updatedData) => {
    setUserInfo(updatedData);
    setIsEditing(false);
  };

  return (
    <>
       <Header toggleSidebar={toggleSidebar} />
     
      <Menu isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Overlay pour masquer le contenu principal lorsque le sidebar est ouvert */}
      {isSidebarOpen && <div className="overlay" onClick={toggleSidebar}></div>}

      <div className="profile-container">
        <aside className="profile-sidebar">
          <div className="profile-header">
            <h2 className="profile-name">{userInfo.name}</h2>
          </div>
          <ul className="profile-menu">
            <li className={activeTab === "info" ? "active" : ""} onClick={() => setActiveTab("info")}>
              <FiUser className="icon" /> Informations personnelles
            </li>
            <li className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}>
              <FiPackage className="icon" /> Mes commandes
            </li>
            <li className={activeTab === "wishlist" ? "active" : ""} onClick={() => setActiveTab("wishlist")}>
              <FiHeart className="icon" />Mes favoris
            </li>
           
            <li onClick={() => setActiveTab("notifications")} className={activeTab === "notifications" ? "active" : ""}>
              <FiBell className="icon" /> Notifications
            </li>
            {/* Menu principal "Créer ma boutique" */}
        <li 
          className={boutiqueOpen ? "active" : ""} 
          onClick={() => setBoutiqueOpen(!boutiqueOpen)} 
          style={{ cursor: "pointer"}}
        >
          <AiFillShop className="icon" /> Créer ma boutique
          <span style={{ float: "right" }}>{boutiqueOpen ? "▲" : "▼"}</span>
        </li>

        {/* Sous-menu, affiché seulement si boutiqueOpen est vrai */}
        {boutiqueOpen && (
          <>
            <li
              className={activeTab === "addproduct" ? "active" : ""}
              onClick={() => setActiveTab("addproduct")}
              style={{ paddingLeft: "30px", cursor: "pointer" }}
            >
              <AiFillProduct className="icon" /> Mes produits
            </li>
            <li
              className={activeTab === "manageorders" ? "active" : ""}
              onClick={() => setActiveTab("manageorders")}
              style={{ paddingLeft: "30px", cursor: "pointer" }}
            >
              <MdOutlineDisplaySettings className='icon' /> Gérer les commandes
            </li>
          </>
        )}

            
            <li className="logout" onClick={handleLogout}>
              <FiLogOut className="icon" /> Déconnexion
            </li>
          </ul>
        </aside>

        <main className="profile-content">
          {activeTab === "orders" && (
            <>
             
              <div className="orders">
                {commandes.length === 0 ? (
                  <p>Vous n'avez pas encore passé de commande.</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>DATE</th>
                        <th>PRIX</th>
                        <th>STATUS</th>
                        <th>ACTIONS</th>

                      </tr>
                    </thead>
                    <tbody>
                      {commandes.map((commande) => (
                        <tr key={commande.id}>
                          <td>{new Date(commande.dateCommande).toLocaleDateString()}</td>
                          <td>${Number(commande.montantTotal).toFixed(2)}</td>
                          <td className={`statut ${commande.statut.toLowerCase()}`}>{commande.statut}</td>
                          <td>
                            <button
                              className="detail-button"
                              onClick={() => (window.location.href = `/commande/${commande.id}`)}
                            >
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
          )}

          {activeTab === "info" && (
            <>
             
              {!isEditing ? (
                <div className="form-grid">
                  <div className="form-group">
                    <label>Adresse email*</label>
                    <input type="email" value={userInfo?.email || ''} disabled />
                  </div>
                  <div className="form-group">
                    <label>Prénom*</label>
                    <input type="text" value={userInfo?.nom || ''} disabled />
                  </div>
                  <div className="form-group">
                    <label>Nom*</label>
                    <input type="text" value={userInfo?.prenom || ''} disabled />
                  </div>
                  <div className="form-group">
                    <label>Téléphone*</label>
                    <input type="text" value={userInfo?.tel || ''} disabled />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="save-changes-btn"
                  >
                    Modifier mes informations
                  </button>
                </div>
              ) : (
                <ProfilEdit userInfo={userInfo} onUpdate={handleUpdate} />
              )}
            </>
          )}


        {activeTab === "addproduct" && (
  <>
    {editingProduct ? (
      /* Formulaire d’édition (déjà présent) */
      <div className="edit-product-form">
        <form onSubmit={handleProductSubmit} encType="multipart/form-data">
          {/* ... tes inputs ... */}
          <div className="form-group">
            <label>Image:</label>
            {productForm.image_url && (
              <div style={{ marginBottom: "10px" }}>
                <img
                  src={`http://127.0.0.1:8000${productForm.image_url}`} 
                  alt="Produit"
                  width="100"
                />
              </div>
            )}
            <input type="file" name="image" onChange={handleFileChange} />
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button type="submit" className="details-button">Confirmer</button>
            <button type="button" className="details-button" onClick={() => setEditingProduct(false)}>Annuler</button>
          </div>
        </form>
      </div>
    ) : (
      <>
        <h1 className="titre">Mes produits</h1>
        <table className="orders">
          <thead>
            <tr>
              <th>Image</th>
              <th>Nom</th>
              <th>Prix</th>
              <th>Catégories</th>
              <th>Actions</th>
              <th>
                Nouveau produit <Link to="/addproduct" className="add-button" title="Add Product">
                  <RiHeartAdd2Fill color="black" size={30} />
                </Link>
              </th>
            </tr>
          </thead>
          <tbody>
            {mesProduits.map((product) => (
              <tr key={product.id}>
                <td>
                  <img
                    src={product.image?.startsWith('http') ? product.image : `http://127.0.0.1:8000${product.image}`}
                    alt={product.name}
                    height={100}
                    width={100}
                    style={{ objectFit: 'cover' }}
                  />
                </td>
                <td>{product.name}</td>
                <td>${Number(product.price).toFixed(2)}</td>
                <td>{product.category}</td>
                <td>
                  <button onClick={() => handleEditProduct(product)} className="details-button edit">
                    <AiFillEdit />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="details-button delete">
                    <AiFillDelete />
                  </button>
                </td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    )}
  </>
)}


         {activeTab === "wishlist" && (
  <>

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
                <p>{item.product.price} $</p>
              </div>
              <div className="wishlist-buttons">
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
)}


          {activeTab === "notifications" && (
                <>
               <div className='notifications'>
          <div className="notifications-container"> 
           
            {loadingNotif ? (
              <p>Chargement...</p>
            ) : notifications.length > 0 ? (
              <ul>
                {notifications.map((notif) => (
                  <li key={notif.id} className={`notif notif-${notif.type}`}>
                    <strong>{notif.type.toUpperCase()}:</strong> {notif.message}
                    <br />
                    <small>{new Date(notif.dateEnvoi).toLocaleString()}</small>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Aucune notification pour le moment.</p>
            )}
          </div>
          </div>
            </>



          )}
          {activeTab === "manageorders" && (
            <>
              <h1 className="titre">Gérer les commandes</h1>
              <table className="orders">
                <thead>
                  <tr>


                    <th>Client</th>
                    <th>Total</th>
                    <th>Statut</th>
                    <th>Actions</th>


                  </tr>
                </thead>
                <tbody>
                  {commandes.map(commande => (
                    <tr key={commande.id}>
                      <td>{commande.client?.utilisateur?.prenom} {commande.client?.utilisateur?.nom}</td>
                      <td>{commande.montantTotal} €</td>
                      <td className={`statut ${commande.statut.toLowerCase()}`}>{commande.statut}</td>
                      <td className="actions">
                        <button className="details-button" onClick={() => { changerStatut(commande.id, 'VALIDÉE'); envoyerNotification(commande.id,"Validée", commande.client?.utilisateur?.id) }}>Validée</button>
                        <button className="details-button" onClick={() => { changerStatut(commande.id, 'EXPÉDIÉ'); envoyerNotification(commande.id,"EXPÉDIÉ", commande.client?.utilisateur?.id) }}>Expédiée</button>
                        <button className="details-button" onClick={() => { changerStatut(commande.id, 'ANNULÉE'); envoyerNotification(commande.id,"ANNULÉE", commande.client?.utilisateur?.id) }}>Annulée</button>

                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>


            </>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
};

export default Profil;


