import React, { useState, useEffect } from 'react';
import api from '../../api';
import "../../styles/GestionProduit.css";

const GestionProduit = () => {
  const [produits, setProduits] = useState([]);
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
  const [editing, setEditing] = useState(false);

  // Options pour la liste déroulante des catégories
  const categories = ["Teint", "Yeux", "Lèvres"];

  useEffect(() => {
    fetchProduits();
  }, []);

  const fetchProduits = async () => {
    try {
      const response = await api.get('/products/');
      setProduits(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des produits', error);
    }
  };

  const handleChange = (e) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      if (editing) {
        await api.put(`/produits/${productForm.id}/modifier/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Produit modifié avec succès');
      } else {
        await api.post('/api/produits/ajouter/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Produit ajouté avec succès');
      }

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
      setEditing(false);
      fetchProduits();
    } catch (error) {
      console.log("Données envoyées:", {
        name: productForm.name,
        description: productForm.description,
        price: productForm.price,
        category: productForm.category,
        stockDisponible: productForm.stockDisponible,
        ingredient: productForm.ingredient,
        image: productForm.image instanceof File ? "Fichier présent" : "Aucun fichier"
      });
      console.error('Erreur lors de la soumission du produit', error);
      alert("Catégorie introuvable");
    }
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

  const handleEdit = (produit) => {
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
    setEditing(true);
  };

  return (
    <div className="gestion-produit">
      <h1>Gestion des Produits</h1>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <h2>{editing ? 'Modifier le Produit' : 'Ajouter un Produit'}</h2>

        <label>Nom:</label>
        <input type="text" name="name" value={productForm.name} onChange={handleChange} required />

        <label>Description:</label>
        <input type="text" name="description" value={productForm.description} onChange={handleChange} required />

        <label>Prix:</label>
        <input type="number" name="price" value={productForm.price} onChange={handleChange} required />

        <label>Catégorie:</label>
        <div style={{
          position: 'relative',
          width: '100%',
          marginBottom: '20px'
        }}>
          <select 
            name="category" 
            value={productForm.category} 
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '12px 15px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: 'white',
              fontSize: '16px',
              color: '#333',
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}
          >
            <option value="">Sélectionnez une catégorie</option>
            {categories.map((cat, index) => (
              <option 
                key={index} 
                value={cat}
                style={{
                  padding: '10px 15px',
                  backgroundColor: 'white',
                  color: '#333'
                }}
              >
                {cat}
              </option>
            ))}
          </select>
          <span style={{
            position: 'absolute',
            top: '50%',
            right: '15px',
            transform: 'translateY(-50%)',
            color: '#666',
            pointerEvents: 'none'
          }}>▼</span>
        </div>

        <label>Stock Disponible:</label>
        <input type="number" name="stockDisponible" value={productForm.stockDisponible} onChange={handleChange} required />

        <label>Ingrédient:</label>
        <input type="text" name="ingredient" value={productForm.ingredient} onChange={handleChange} required />

        <label>Image:</label>
        {editing && productForm.image_url && (
          <div style={{ marginBottom: "10px" }}>
            <img src={`http://127.0.0.1:8000${productForm.image_url}`} alt="Produit" width="100" />
          </div>
        )}
        <input type="file" name="image" onChange={handleFileChange} />

        <button type="submit">{editing ? 'Modifier' : 'Ajouter'}</button>
      </form>

      <h2>Liste des Produits</h2>
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Description</th>
            <th>Prix</th>
            <th>Catégorie</th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {produits.map(produit => (
            <tr key={produit.id}>
              <td>{produit.name}</td>
              <td>{produit.description}</td>
              <td>{produit.price} €</td>
              <td>{produit.category}</td>
              <td>
                {produit.image && (
                  <img
                    src={produit.image}
                    alt="Produit"
                    width="80"
                  />
                )}
              </td>
              <td>
                <button onClick={() => handleEdit(produit)}>Modifier</button>
                <button onClick={() => handleDelete(produit.id)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Styles intégrés */}
      <style>{`
        select:focus {
          outline: none;
          border-color: #a18aff;
          box-shadow: 0 0 0 2px rgba(161, 138, 255, 0.2);
        }
        
        option:hover {
          background-color: #f0ebff !important;
        }
        
        select option[value=""] {
          color: #999;
        }
      `}</style>
    </div>
  );
};

export default GestionProduit;