import React, { useState, useEffect } from 'react';
import "../../styles/Profil.css";
import { FiUser, FiPackage, FiHeart, FiLogOut } from "react-icons/fi";
import { AiFillProduct, AiFillDelete, AiFillEdit } from "react-icons/ai";
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import { RiHeartAdd2Fill } from 'react-icons/ri';

import { Link } from 'react-router-dom';
import Footer from '../UI/Footer';
import Header from '../UI/Header';
import api from "../../api";
import Menu from '../UI/Menu';
import { useNavigate } from "react-router-dom";
import ProfilEdit from './ProfilEdit';

const Profil = () => {
  const [activeTab, setActiveTab] = useState("info");
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [commandes, setCommandes] = useState([]);
  const [mesProduits, setMesProduits] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

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
      fetchCommandes();
    } else if (activeTab === "addproduct") {
      fetchProduits();
    }
  }, [activeTab]);

  const fetchCommandes = () => {
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
      <Menu isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Header toggleSidebar={toggleSidebar} />

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
            <li className={activeTab === "addproduct" ? "active" : ""} onClick={() => setActiveTab("addproduct")}>
              <AiFillProduct className="icon" /> My Product
            </li>
            <li className="logout" onClick={handleLogout}>
              <FiLogOut className="icon" /> Log Out
            </li>
          </ul>
        </aside>

        <main className="profile-content">
          {activeTab === "orders" && (
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
                            <button
                              className="details-button"
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
                <div className="edit-product-form">
                  <form onSubmit={handleProductSubmit} encType="multipart/form-data">
                    <div className="form-group">
                      <label>Nom:</label>
                      <input type="text" name="name" value={productForm.name} onChange={handleProductChange} required />
                    </div>

                    <div className="form-group">
                      <label>Description:</label>
                      <input type="text" name="description" value={productForm.description} onChange={handleProductChange} required />
                    </div>

                    <div className="form-group">
                      <label>Prix:</label>
                      <input type="number" name="price" value={productForm.price} onChange={handleProductChange} required />
                    </div>

                    <div className="form-group">
                      <label>Catégorie:</label>
                      <input type="text" name="category" value={productForm.category} onChange={handleProductChange} required />
                    </div>

                    <div className="form-group">
                      <label>Stock Disponible:</label>
                      <input type="number" name="stockDisponible" value={productForm.stockDisponible} onChange={handleProductChange} required />
                    </div>

                    <div className="form-group">
                      <label>Ingrédient:</label>
                      <input type="text" name="ingredient" value={productForm.ingredient} onChange={handleProductChange} required />
                    </div>

                    <div className="form-group">
                      <label>Image:</label>
                      {productForm.image_url && (
                        <div style={{ marginBottom: "10px" }}>
                          <img src={`http://127.0.0.1:8000${productForm.image_url}`} alt="Produit" width="100" />
                        </div>
                      )}
                      <input type="file" name="image" onChange={handleFileChange} />
                    </div>
                    <td>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <button type="submit" className="details-button">Confirmer</button>
                        <button type="button" className="details-button" onClick={() => setEditingProduct(false)}>
                          Annuler
                        </button>
                      </div>
                    </td>

                  </form>
                </div>
              ) : (
                <>
                  <div>

                  </div>
                  <h1 className="titre">My Products</h1>

                  <table className="orders">
                    <thead>
                      <tr>
                        <th>PRODUCT</th>
                        <th>NAME</th>
                        <th>PRICE</th>
                        <th>CATEGORY</th>
                        <th>ACTIONS</th>
                        <th>
                        NEW PRODUCT <Link to="/addproduct" className="add-button" title="Add Product">
                            <RiHeartAdd2Fill color="black" size={30} />

                          </Link></th>
                      </tr>
                    </thead>
                    <tbody>
                      {mesProduits.map((product) => (
                        <tr key={product.id}>
                          <td><img src={product.image} height={100} width={100} alt={product.name} /></td>
                          <td>{product.name}</td>
                          <td>${product.price}</td>
                          <td>{product.category}</td>
                          <td>
                            <td>
                              <button
                                className="details-button"
                                onClick={() => handleEditProduct(product)}
                                title="Modifier"
                              >
                                Modifier
                              </button>
                            </td>
                            <td>
                              <button
                                className="details-button"
                                onClick={() => handleDelete(product.id)}
                                title="Supprimer"
                              >
                                Supprimer
                              </button>
                            </td>
                          </td>
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
              <h1 className="titre">Wishlist</h1>
              <p>Contenu de la wishlist ici.</p>
            </>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
};

export default Profil;