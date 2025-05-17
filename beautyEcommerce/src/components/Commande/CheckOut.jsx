import React, { useState, useEffect } from 'react';
import '../../styles/CheckOut.css';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import Menu from "../UI/Menu";
import Header from "../UI/Header";
import Footer from "../UI/Footer";

const CheckOut = () => {
  const token = localStorage.getItem("access_token");

  const [formData, setFormData] = useState({
    rue: '',
    codePostal: '',
    ville: '',
    pays: ''
  });

  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [error, setError] = useState("");

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validation de l'email
  if (!email.match(/^[^\s@]+@(example\.com|gmail\.com)$/)) {
    setError("L'email doit se terminer par @example.com ou @gmail.com.");
    return;
  }

  // ✅ Validation du téléphone
  if (!/^\d{10}$/.test(tel)) {
    setError("Le numéro de téléphone doit contenir exactement 10 chiffres.");
    return;
  }
  if (!/^0[5-7]/.test(tel)) {
    setError("Le numéro de téléphone doit commencer par 05, 06 ou 07.");
    return;
  }

  // ✅ Validation du code postal (5 chiffres)
  if (!/^\d{5}$/.test(formData.codePostal)) {
    setError("Le code postal doit contenir exactement 5 chiffres.");
    return;
  }

  // Aucune erreur, on peut continuer
  setError("");

  
    const orderData = {
      ...formData,
      items: cartItems.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity
      }))
    };
  
    try {
      const res = await api.post("commande/", orderData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

  
        // Rediriger l'utilisateur vers la page de confirmation avec l'ID de la commande
        navigate(`/paiement/${res.data.commande_id}/${subtotal}`);


  } catch (err) {
    console.error(err.response?.data || err.message);
    alert("Erreur lors du passage de la commande.");
  }
    
  };
  

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get("get_cart/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const items = res.data.items;
        setCartItems(items);

        const total = items.reduce((acc, item) => acc + Number(item.product.price) * item.quantity, 0);
        setSubtotal(total);

      } catch (error) {
        console.error('Erreur chargement panier :', error);
      }
    };

    if (token) {
      fetchCart();
    }
  }, [token]);

  return (
    <> 
    <div className="checkout-container">
       <Header toggleSidebar={toggleSidebar} />
     
      <Menu isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Overlay pour masquer le contenu principal lorsque le sidebar est ouvert */}
      {isSidebarOpen && <div className="overlay" onClick={toggleSidebar}></div>}

      <div className="checkout-form">
        <h2>Coordonnées </h2>
        {error && <div className="error-message">{error}</div>}

        <div className="form-row">
          <input type="text" placeholder="Nom" />
          <input type="text" placeholder="Prénom" />
        </div>
        <div className="form-row">
          <input
  type="email"
  placeholder="E-mail"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
<input
  type="text"
  placeholder="Téléphone"
  value={tel}
  onChange={(e) => setTel(e.target.value)}
/>

        </div>

        <h2>Adresse de livraison</h2>
        <div className="form-row">
          <input
            type="text"
            placeholder="Pays"
            name="pays"
            value={formData.pays}
            onChange={handleChange}
          />
          <input
            type="text"
            placeholder="Ville"
            name="ville"
            value={formData.ville}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <input
            type="text"
            placeholder="Code postal "
            name="codePostal"
            value={formData.codePostal}
            onChange={handleChange}
          />
          <input
            type="text"
            placeholder="Adresse, appartement"
            name="rue"
            value={formData.rue}
            onChange={handleChange}
          />
        </div>

        <div className="shipping-method">
          <label>
            <input type="radio" name="shipping" /> ÉDAHABIA
          </label>
          <label>
            <input type="radio" name="shipping" /> Carte bancaire
          </label>
         
        </div>

        <button className="payment-button" onClick={handleSubmit}>PAIEMENT</button>
        <a href="#" className="back-link">Retourner au panier</a>
      </div>

      <div className="checkout-summary">
       
        {cartItems.map(item => (
          <div className="order-item" key={item.id}>
            <img src={`http://127.0.0.1:8000${item.product.image}`} alt={item.product.nom} />
            <div className="summary-info">
              <p>{item.product.nom}</p>
              <small>{item.product.volume || ''}</small>
              <p>Price: ${Number(item.product.price).toFixed(2)}</p>
              <p>Quantity: {item.quantity}</p>
            </div>
          </div>
        ))}

        <div className="summary-details">
          <p>Sous total: ${subtotal.toFixed(2)}</p>
          <p className="summary-total">Total: ${subtotal.toFixed(2)}</p>
        </div>
        
      </div>
      
    </div>
    <Footer />

    </>
    
  );
};

export default CheckOut;
