import "../../styles/styleProduct.css";
import React, { useEffect, useState } from 'react';
import { FaShoppingCart, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../api";
import Footer from "../UI/Footer";
import InstaSection from "../UI/InstaSection";
import Header from "../UI/Header";
import MiniCarte from "../cart/MiniCarte";
import { v4 as uuidv4 } from 'uuid';

const ProductPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({});
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [commentaires, setCommentaires] = useState([]);
  const [note, setNote] = useState(5);
  const [contenu, setContenu] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMiniCart, setShowMiniCart] = useState(false);
  const [miniCartItems, setMiniCartItems] = useState([]);


  const token = localStorage.getItem('access_token');

  const scrollComments = (direction) => {
    const container = document.getElementById('commentaires-scroll');
    const scrollAmount = 320; // correspond à la largeur des cartes + margin
  
    if (container) {
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };
  

  let cart_code = localStorage.getItem("cart_code");
  if (!cart_code) {
    cart_code = Date.now().toString();
    localStorage.setItem("cart_code", cart_code);
  }

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/product_detail/${slug}/`);
        setProduct(response.data);

        const similarResponse = await api.get(`/products/?category=${response.data.category}`);
        setSimilarProducts(similarResponse.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des détails du produit:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [slug]);
  
  useEffect(() => {
    setShowMiniCart(false); // Cacher le mini panier quand on change de produit
  }, [slug]);
  

  useEffect(() => {
    if (slug) {
      api.get(`/product_detail/${slug}/commentaires/`)
        .then(res => {
          setCommentaires(res.data);
        })
        .catch(err => {
          console.error("Erreur lors du chargement des commentaires :", err);
        });
    }
  }, [slug]);

  const handleQuantityChange = (action) => {
    if (action === 'increase') setQuantity(quantity + 1);
    else if (action === 'decrease' && quantity > 1) setQuantity(quantity - 1);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!contenu || !note) return;

    setIsSubmitting(true);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await api.post(`/product_detail/${slug}/commentaires/`, {
        produit: product.id,
        noteSur5: note,
        contenu: contenu,
      }, config);

      const res = await api.get(`/product_detail/${slug}/commentaires/`);
      setCommentaires(res.data);

      setContenu("");
      setNote(5);
    } catch (err) {
      console.error("Erreur lors de l'envoi du commentaire :", err);
      if (err.response?.status === 401) {
        alert("Votre session a expiré. Veuillez vous reconnecter.");
      } else {
        alert("Erreur lors de l'envoi du commentaire.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  const addToCart = () => {
    const payload = {
      product_id: product.id,
      quantity: quantity,
    };
  
    const newItem = {
      product: {
        ...product,
      },
      quantity: quantity,
    };
  
    // Cas visiteur
    if (!token) {
      let sessionId = localStorage.getItem("session_id");
      if (!sessionId) {
        sessionId = uuidv4();
        localStorage.setItem("session_id", sessionId);
      }
      payload.session_id = sessionId;
  
      // Ajout localStorage
      let visitorCart = JSON.parse(localStorage.getItem("visitor_cart")) || [];
      const existingIndex = visitorCart.findIndex(item => item.product_id === product.id);
  
      if (existingIndex !== -1) {
        visitorCart[existingIndex].quantity += quantity;
      } else {
        visitorCart.push({ product_id: product.id, quantity: quantity });
      }
      localStorage.setItem("visitor_cart", JSON.stringify(visitorCart));
  
      // Appel backend + mini panier
      api.post("add_item/", payload)
        .then(() => {
          setMiniCartItems([newItem]);
          setShowMiniCart(true);
        })
        .catch(error => {
          console.error("Erreur ajout panier visiteur:", error.response?.data || error.message);
        });
  
      return;
    }
  
    // Cas connecté
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  
    api.post("add_item/", payload, config)
      .then(() => {
        setMiniCartItems([newItem]);
        setShowMiniCart(true);
      })
      .catch(error => {
        console.error("Erreur ajout au panier:", error.response?.data || error.message);
      });
  };
  
  
 
  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const colors = product.colors || ["#EED3C6", "#D1AFA2", "#B78E80", "#A67566", "#8D5D4D"];

  return (
    <div className="container">
      <div className="content">
        <Header />

        <div className="product-section">
          <div className="product-image">
            <img src={`http://127.0.0.1:8000${product.image}`} alt={product.name} />
          </div>

          <div className="product-details">
            <h2>{product.name}</h2>
            <p className="description">{product.description}</p>
            <p className="price">{product.price}€</p>

            <div className="color-swatches">
              {colors.map((color, i) => (
                <div key={i} className="swatch" style={{ backgroundColor: color }}></div>
              ))}
            </div>

            <div className="product-actions">
            <button className="add-to-cart" onClick={addToCart}>
              ADD TO CART
            </button>

              <div className="product-details-sections">
                <div className="dropdown">
                  <div className="dropdown-header" onClick={() => toggleDropdown(0)}>
                    <span>INGREDIENTS</span>
                    {openDropdown === 0 ? <FaChevronUp /> : <FaChevronDown />}
                  </div>
                  {openDropdown === 0 && (
                    <div className="dropdown-content">
                      <p>{product.ingredient}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <hr className="dividere" />

        <div className="more-products">
          <h3>MORE OF RosaLuminosa</h3>
          <div className="product-list">
            {similarProducts.length > 0 ? (
              similarProducts.slice(0, 4).map((item) => (
                <div key={item.id} className="product-cards">
                  <Link to={`/products/${item.slug}`} className="product-link">
                    <img src={item.image} alt={item.name} />
                    <h4>{item.name}</h4>
                    <p>{item.price}€</p>
                  </Link>
                </div>
              ))
            ) : (
              <p>No similar products available.</p>
            )}
          </div>
        </div>
       

        <div className="commentaires-section">
            {commentaires.length > 0 && (
               <div className="commentaires-container">
                 <button className="scroll-btn left" onClick={() => scrollComments('left')}>&lt;</button>
                <div className="commentaires-scroll" id="commentaires-scroll">
              {commentaires.map(com => (
                <div key={com.id} className="commentaire">
                  <p><strong>{com.nom_utilisateur || "Anonyme"}</strong> </p>
                  <p> {new Date(com.datePublication).toLocaleDateString()}</p>
                  <div className="note-stars">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span key={n} style={{ color: n <= com.noteSur5 ? 'black' : '#ccc', fontSize: '1.2rem' }}>
                          ★
                        </span>
                      ))}
                    </div>
                  <p>{com.contenu}</p>
                 
                </div>
              ))}
              </div>
               <button className="scroll-btn right" onClick={() => scrollComments('right')}>&gt;</button>
             </div>
            )}

            {token ? (
              <form onSubmit={handleSubmitComment} className="comment-form">
                <h4 className="avis-text">Donnez votre avis sur nos produits</h4>
                <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                onClick={() => setNote(n)}
                style={{
                  cursor: "pointer",
                  fontSize: "1.5rem",
                  color: n <= note ? "black" : "#ccc"
                }}
              >
                ★
              </span>
            ))}
          </div>

                <label>
                  Commentaire :
                  <textarea
                    value={contenu}
                    onChange={(e) => setContenu(e.target.value)}
                    required
                  />
                </label>
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Envoi..." : "Envoyer le commentaire"}
                </button>
              </form>
            ) : (
              <p>Vous devez être connecté pour laisser un commentaire.</p>
            )}
          </div>

        <InstaSection />
        <Footer />
          {/* 👇 Mini panier ici */}
          <MiniCarte
            visible={showMiniCart}
            onClose={() => setShowMiniCart(false)}
            items={miniCartItems}
          />

      </div>
    </div>
  );
};

export default ProductPage;
