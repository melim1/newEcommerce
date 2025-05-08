import React, { useState, useEffect } from 'react';
import '../../styles/CheckOut.css';
import api from '../../api';
import { useNavigate } from 'react-router-dom';

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
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
    <div className="checkout-container">
      <div className="checkout-form">
        <h2>Contacts</h2>
        <div className="form-row">
          <input type="text" placeholder="First Name" />
          <input type="text" placeholder="Last Name" />
        </div>
        <div className="form-row">
          <input type="email" placeholder="E-mail" />
          <input type="text" placeholder="Phone" />
        </div>

        <h2>Shipping address</h2>
        <div className="form-row">
          <input
            type="text"
            placeholder="Country / Region"
            name="pays"
            value={formData.pays}
            onChange={handleChange}
          />
          <input
            type="text"
            placeholder="City"
            name="ville"
            value={formData.ville}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <input
            type="text"
            placeholder="Postal code"
            name="codePostal"
            value={formData.codePostal}
            onChange={handleChange}
          />
          <input
            type="text"
            placeholder="Address, apartment, suite"
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

        <button className="payment-button" onClick={handleSubmit}>PAYMENT</button>
        <a href="#" className="back-link">BACK TO SHOPPING CART</a>
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
          <p>Subtotal: ${subtotal.toFixed(2)}</p>
          <p className="summary-total">Total: ${subtotal.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default CheckOut;
