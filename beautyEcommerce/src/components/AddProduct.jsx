import { useState, useEffect } from "react";
import api from "../api";

import Footer from './UI/Footer';
import Menu from './UI/Menu';

import Header from './UI/Header';
import "./../styles/AddProduct.css";
import { useNavigate } from "react-router-dom";
function AddProduct() {
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
 const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const allerVersAccueil = () => {
    navigate('/');
  };
  const [productData, setProductData] = useState({
    name: '',
    slug: '',
    image: null,
    description: '',
    price: '',
    category: '',
    ingredient: '',
    stockDisponible: 1,
    estDisponible: true,
    client: null,
    admin: null
  });

  useEffect(() => {
    api.get("user_info/")
      .then(res => {
        const id = res.data.id;
        setUserId(id);
        setProductData(prev => ({ ...prev, client: id }));
      })
      .catch(err => {
        console.error("Erreur lors de la récupération des infos utilisateur:", err.message);
      });
  }, []);

  const handleProductChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked :
        type === 'file' ? files[0] :
          value
    }));
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    for (const key in productData) {
      if (productData[key] !== null) {
        formData.append(key, productData[key]);
      }
    }

    try {
      const response = await api.post("/api/produits/ajouter/", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.status === 201 || response.status === 200) {
        setSuccessMessage("Produit ajouté avec succès !");
        // Réinitialiser le formulaire après succès
        setProductData({
          name: '',
          slug: '',
          image: null,
          description: '',
          price: '',
          category: '',
          ingredient: '',
          stockDisponible: 1,
          estDisponible: true,
          client: userId,
          admin: null
        });
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data?.detail || "Erreur de validation. Vérifiez les données saisies.");
      } else if (error.request) {
        setError("Pas de réponse du serveur. Vérifiez votre connexion.");
      } else {
        setError("Erreur inconnue: " + error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
       <Header toggleSidebar={toggleSidebar} />
     
      <Menu isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {isSidebarOpen && <div className="overlay" onClick={toggleSidebar}></div>}

      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow-sm border-0">
              <div className=" text-white">
                <h2 className="h4 mb-0 details-button">Ajouter un nouveau produit</h2>
              </div>

              <div className="card-body p-4">
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {error}
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setError(null)}
                      aria-label="Close"
                    ></button>
                  </div>
                )}

                {successMessage && (
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    {successMessage}
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setSuccessMessage(null)}
                      aria-label="Close"
                    ></button>
                  </div>
                )}

                <form onSubmit={handleProductSubmit}>
                  <div className="row g-3">
                    {/* Colonne gauche */}
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="name" className="form-label fw-semibold">Titre du produit*</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={productData.name}
                          onChange={handleProductChange}
                          required
                          className="form-control"
                          placeholder="Nom du produit"
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="slug" className="form-label fw-semibold">Slug*</label>
                        <input
                          type="text"
                          id="slug"
                          name="slug"
                          value={productData.slug}
                          onChange={handleProductChange}
                          required
                          className="form-control"
                          placeholder="slug-du-produit"
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="price" className="form-label fw-semibold">Prix (€)*</label>
                        <div className="input-group">
                          <input
                            type="number"
                            id="price"
                            name="price"
                            value={productData.price}
                            onChange={handleProductChange}
                            required
                            min="0"
                            step="0.01"
                            className="form-control"
                          />
                          <span className="input-group-text">€</span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="stockDisponible" className="form-label fw-semibold">Stock disponible*</label>
                        <input
                          type="number"
                          id="stockDisponible"
                          name="stockDisponible"
                          value={productData.stockDisponible}
                          onChange={handleProductChange}
                          required
                          min="0"
                          className="form-control"
                        />
                      </div>
                    </div>

                    {/* Colonne droite */}
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="category" className="form-label fw-semibold">Catégorie*</label>
                        <select
                          id="category"
                          name="category"
                          value={productData.category}
                          onChange={handleProductChange}
                          required
                          className="form-select"
                        >
                          <option value="">Sélectionnez une catégorie</option>
                          <option value="Teint">Teint</option>
                          <option value="Yeux">Yeux</option>
                          <option value="Levres">Lèvres</option>
                          <option value="Pinceaux">Pinceaux et Éponges</option>
                        </select>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="image" className="form-label fw-semibold">Image du produit</label>
                        <input
                          type="file"
                          id="image"
                          name="image"
                          accept="image/*"
                          onChange={handleProductChange}
                          className="form-control"
                        />
                        {productData.image && (
                          <div className="mt-2">
                            <small className="text-muted">Fichier sélectionné: {productData.image.name}</small>
                          </div>
                        )}
                      </div>

                      <div className="mb-3">
                        <label htmlFor="ingredient" className="form-label fw-semibold">Ingrédients</label>
                        <input
                          type="text"
                          id="ingredient"
                          name="ingredient"
                          value={productData.ingredient}
                          onChange={handleProductChange}
                          className="form-control"
                          placeholder="Liste des ingrédients, séparés par des virgules"
                        />
                      </div>

                      <div className="form-check form-switch mb-3">
                        <input
                          type="checkbox"
                          id="estDisponible"
                          name="estDisponible"
                          className="form-check-input"
                          role="switch"
                          checked={productData.estDisponible}
                          onChange={handleProductChange}
                        />
                        <label htmlFor="estDisponible" className="form-check-label fw-semibold">Produit disponible</label>
                      </div>
                    </div>

                    {/* Description (pleine largeur) */}
                    <div className="col-12">
                      <div className="mb-3">
                        <label htmlFor="description" className="form-label fw-semibold">Description*</label>
                        <textarea
                          id="description"
                          name="description"
                          value={productData.description}
                          onChange={handleProductChange}
                          required
                          className="form-control"
                          rows="4"
                          placeholder="Décrivez le produit en détail..."
                        ></textarea>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                        <button
                          type="submit"
                          className=" details-button"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              En cours...
                            </>
                          ) : (
                            "Ajouter le produit"
                          )}
                        </button>
                        <button onClick={allerVersAccueil} className="details-button" >
                          Annuler
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>


      </div>
      <Footer/>
    </>

  );
}

export default AddProduct;