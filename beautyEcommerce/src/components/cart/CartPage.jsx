import React, { useState, useEffect } from 'react';
import "../../styles/Cart.css";
import { useNavigate } from "react-router-dom";
import Footer from '../UI/Footer';
import Header from '../UI/Header';
import api from '../../api';
import { v4 as uuidv4 } from 'uuid';
import { jwtDecode } from 'jwt-decode';

const isAuthenticated = () => {
  const token = localStorage.getItem("access_token");
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;
    return decoded.exp > now;
  } catch {
    return false;
  }
};

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(localStorage.getItem("session_id"));
  const userRole = localStorage.getItem("user_role");

  useEffect(() => {
    if (!sessionId) {
      const newSessionId = uuidv4();
      localStorage.setItem("session_id", newSessionId);
      setSessionId(newSessionId);
    }
  }, [sessionId]);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("access_token");
       

        let url = 'get_cart/';
        let config = {};

        if (token && userRole === "CLIENT") {
          config.headers = {
            Authorization: `Bearer ${token}`
          };
        } else {
          const currentSessionId = localStorage.getItem("session_id");
          if (!currentSessionId) {
            console.error("Error: session_id is missing for the visitor.");
            return;
          }
          url += `?session_id=${currentSessionId}`;
        }

        const response = await api.get(url, config);
        setCartItems(response.data.items || []);
        setCartTotal(response.data.sum_total || 0);
      } catch (err) {
        console.error("Cart error:", err.response?.data || err.message);
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
        session_id: !isAuthenticated() ? sessionId : undefined
      };

      await api.patch("update_quantity/", payload);

      const updatedItems = cartItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQty } : item
      );

      setCartItems(updatedItems);
      updateTotal(updatedItems);
      if (!isAuthenticated()) {
        const formatted = updatedItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        }));
        localStorage.setItem("visitor_cart", JSON.stringify(formatted));
      }
    } catch (err) {
      console.error("Erreur maj quantité:", err);
    }
  };

  const deleteCartItem = async (itemId) => {
    if (!window.confirm("Supprimer l'article ?")) return;

    try {
      await api.post("delete_cartitem/", {
        item_id: itemId,
        session_id: !isAuthenticated() ? sessionId : undefined
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
        <h2 className="cart-title">Mon panier</h2>

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
              <p>Il n’y a aucun article dans votre panier.</p>
            )}
          </div>

          <div className="cart-summary">
            <h3>Détail de la commande</h3>
            <hr className="cart-summary-divider" />
            <div className="summary-details">
              <p>Sous-total: <span>${cartTotal.toFixed(2)}</span></p>
              
              <hr className="cart-summary-divider" />
              <p>Total: <span>${cartTotal.toFixed(2)}</span></p>
            </div>

            <button
              className="checkout-button"
              onClick={() => {
                if (isAuthenticated()) {
                  navigate("/checkout");
                } else {
                  alert("Veuillez vous connecter ou vous inscrire pour finaliser votre commande.");
                  localStorage.setItem("redirect_after_login", "/checkout");
                  navigate("/login");
                }
              }}
            >
             VALIDER MON PANIER
            </button>

            <button className="continue-shopping" onClick={() => navigate("/")}>
           POURSUIVRE LES ACHATS
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CartPage;
