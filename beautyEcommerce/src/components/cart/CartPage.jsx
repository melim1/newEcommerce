import React, { useState, useEffect } from 'react';
import "../../styles/Cart.css";
import { useNavigate } from "react-router-dom";
import Footer from '../UI/Footer';
import Header from '../UI/Header';
import api from '../../api';
import { v4 as uuidv4 } from 'uuid';

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(localStorage.getItem("session_id"));
  const userRole = localStorage.getItem("user_role");
  const isAuthenticated = !!localStorage.getItem("token");

  useEffect(() => {
    if (!sessionId) {
      const newSessionId = uuidv4();
      localStorage.setItem("session_id", newSessionId);
      setSessionId(newSessionId);
    }
  }, []);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("access_token");
        const role = localStorage.getItem("user_role")?.toUpperCase();
  
        let url = 'get_cart/';
        let config = {};
  
        if (token && role === "CLIENT") {
          // 🟢 Client connecté → pas de session_id
          config.headers = {
            Authorization: `Bearer ${token}`
          };
        } else {
          // 🔵 Visiteur → session_id obligatoire
          const currentSessionId = localStorage.getItem("session_id");
          if (!currentSessionId) return;
          url += `?session_id=${currentSessionId}`;
        }
  
        const response = await api.get(url, config);
        setCartItems(response.data.items || []);
        setCartTotal(response.data.sum_total || 0);
      } catch (err) {
        console.error("Erreur panier:", err.message);
        if (err.response?.status === 404) {
          setCartItems([]);
          setCartTotal(0);
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchCart();
  }, []);
  
  
  const updateItemQuantity = async (itemId, newQty) => {
    try {
      const payload = {
        item_id: itemId,
        quantity: newQty,
        session_id: !isAuthenticated ? sessionId : undefined
      };

      await api.patch("update_quantity/", payload);

      const updatedItems = cartItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQty } : item
      );
      
      setCartItems(updatedItems);
      updateTotal(updatedItems);
    } catch (err) {
      console.error("Erreur maj quantité:", err);
    }
  };

  const deleteCartItem = async (itemId) => {
    if (!window.confirm("Supprimer l'article ?")) return;

    try {
      await api.post("delete_cartitem/", { 
        item_id: itemId,
        session_id: !isAuthenticated ? sessionId : undefined
      });

      const updatedItems = cartItems.filter(item => item.id !== itemId);
      setCartItems(updatedItems);
      updateTotal(updatedItems);
    } catch (err) {
      console.error("Erreur suppression:", err.message);
    }
  };

  const updateTotal = (items) => {
    const newTotal = items.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );
    setCartTotal(newTotal);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <div className="cart-container">
        <Header />
        <hr className="divider" />
        <h2 className="cart-title">Your Shopping Cart</h2>

        <div className="cart-content">
          <div className="cart-items">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <img src={`http://127.0.0.1:8000${item.product.image}`} alt={item.product.name} />
                  <div className="cart-item-details">
                    <h3 className='product-name'>{item.product.name}</h3>
                    <p className='product-price'>
                      ${(Number(item.product.price) * item.quantity).toFixed(2)} (Unit: ${Number(item.product.price).toFixed(2)})
                    </p>

                    <div className="cart-item-quantity">
                      <button onClick={() => updateItemQuantity(item.id, Math.max(1, item.quantity - 1))}>-</button>
                      <span className='product-quantity'>{item.quantity}</span>
                      <button onClick={() => updateItemQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>

                    <button className="cart-item-remove" onClick={() => deleteCartItem(item.id)}>
                      Supprimer
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>Your cart is empty.</p>
            )}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <hr className="cart-summary-divider" />
            <div className="summary-details">
              <p>Subtotal: <span>${cartTotal.toFixed(2)}</span></p>
              <p>Shipping: <span>Calculated on checkout</span></p>
              <hr className="cart-summary-divider" />
              <p>Total: <span>${cartTotal.toFixed(2)}</span></p>
            </div>

            <button 
  className="checkout-button" 
  onClick={() => navigate("/checkout")}
>
  CHECKOUT NOW
</button>



            <button className="continue-shopping" onClick={() => navigate("/")}>
              CONTINUE SHOPPING
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CartPage;
