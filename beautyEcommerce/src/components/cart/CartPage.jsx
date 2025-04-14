import React, { useState, useEffect } from 'react';
import "../../styles/Cart.css";
import { useNavigate } from "react-router-dom";
import Footer from '../UI/Footer';
import Header from '../UI/Header';
import api from '../../api';

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const cart_code = localStorage.getItem("cart_code");
  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  
    api.get("get_cart/", config)
      .then(res => {
        console.log("Panier:", res.data);
        setCartItems(res.data.items);
        setCartTotal(res.data.sum_total);
      })
      .catch(err => {
        console.log("Erreur panier:", err.message);
      });
  }, []);
  

  const updateItemQuantity = (itemId, newQty) => {
    api.patch("update_quantity/", {
      item_id: itemId,
      quantity: newQty,
    })
    .then(res => {
      const updatedItem = res.data.data;
      const updatedItems = cartItems.map(it =>
        it.id === itemId ? { ...it, quantity: updatedItem.quantity } : it
      );
      setCartItems(updatedItems);

      const newTotal = updatedItems.reduce(
        (acc, it) => acc + it.product.price * it.quantity,
        0
      );
      setCartTotal(newTotal);
    })
    .catch(err => console.log("Erreur maj quantité:", err));
  };

  const deleteCartItem = (itemId) => {
    const confirmDelete = window.confirm("Supprimer l'article ?");
    if (confirmDelete) {
      api.post("delete_cartitem/", { item_id: itemId })
        .then(res => {
          console.log(res.data);
          const updatedItems = cartItems.filter(it => it.id !== itemId);
          setCartItems(updatedItems);

          const newTotal = updatedItems.reduce(
            (acc, it) => acc + it.product.price * it.quantity,
            0
          );
          setCartTotal(newTotal);
        })
        .catch(err => {
          console.log("Erreur suppression:", err.message);
        });
    }
  };
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
                      ${parseFloat(item.product.price * item.quantity).toFixed(2)} (Unit: ${parseFloat(item.product.price).toFixed(2)})
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
              <hr className="cart-summary-divider" />
            </div>

            <button className="checkout-button" onClick={() => navigate("/checkout")}>CHECKOUT NOW</button>
            <button className="continue-shopping" onClick={() => navigate("/")}>CONTINUE SHOPPING</button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CartPage;
