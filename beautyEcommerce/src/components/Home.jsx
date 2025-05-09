import '../styles/styles.css';
import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import Footer from './UI/Footer';
import InstaSection from './UI/InstaSection';
import Header from './UI/Header';
import Menu from './UI/Menu';
import { FaHeart, FaRegHeart } from 'react-icons/fa';


function Home() {
  const [products, setProducts] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [wishlist, setWishlist] = useState([]);


  // Fonction pour gérer l'ouverture/fermeture du sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  useEffect(() => {
    api.get('/products/') 
      .then(response => {
        setProducts(response.data); 
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des produits:', error);
      });
  }, []);

  useEffect(() => {
    api.get('/products/')
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des produits:', error);
      });
  
    api.get('/wishlist/')
      .then(response => {
        const productIds = response.data.map(item => item.product);
        setWishlist(productIds);
      })
      .catch(error => {
        console.error("Erreur lors de la récupération de la wishlist :", error);
      });
  }, []);
  const toggleWishlist = (productId) => {
    if (wishlist.includes(productId)) {
      api.delete('/wishlist/', { data: { product: productId } })
        .then(() => {
          setWishlist(prev => prev.filter(id => id !== productId));
        })
        .catch(err => console.error("Erreur suppression :", err));
    } else {
      api.post('/wishlist/', { product: productId })
        .then(() => {
          setWishlist(prev => [...prev, productId]);
        })
        .catch(err => console.error("Erreur ajout :", err));
    }
  };
  

  return (
    <div className="landing-page">
      {/* Passer les props pour gérer l'état du sidebar */}
      <Header toggleSidebar={toggleSidebar} />
     
      <Menu isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Overlay pour masquer le contenu principal lorsque le sidebar est ouvert */}
      {isSidebarOpen && <div className="overlay" onClick={toggleSidebar}></div>}

      {/* Banner */}
      <section className="banner">

      <div className="banner-text">
    <h1>Bienvenue</h1>
    <p>Découvrez nos collections makeup.</p>
  </div>
  <div className="banner-slider">
    <img src="/images/banner21.jpg" alt="image 1" />
    <img src="/images/banner28.jpg" alt="image 2" />
    <img src="/images/banner27.jpg" alt="image 3" />
  </div>

  
</section>






      <hr className="dividers"></hr>
    

      {/* Most Wanted */}
      <section className="most-wanted">
      <p className="title">Voir plus de</p>
        <h3>IGLAM</h3>
        <div className="products">
          {products.slice(0, 4).map(product => (
            <div key={product.id} className="product-card">
              
            <div className="wishlist-icon" onClick={() => toggleWishlist(product.id)}>
              {wishlist.includes(product.id) ? (
                <FaHeart color="black" />
              ) : (
                <FaRegHeart />
              )}
            </div>
            <Link to={`products/${product.slug}`} className="product-link">
              <img src={product.image} alt={product.name} />
              <h3>{product.name}</h3>
              <p>${product.price}</p>
            </Link>
          </div>
          
          ))}
        </div>
      </section>
      <hr className="dividers"></hr>

      {/* Shop by Category */}
      <section className="shop-by-category">
        <h2>Nos catégories</h2>
        <div className="categories">
          <div className="category" id="eyes">
            <img src="/images/img2.jpg" alt="Cosmetic Products" />
            <h3>Yeux</h3>
          </div>
          <div className="category" id="face">
            <img src="/images/img1.jpg" alt="Cosmetic Products" />
            <h3>Teint</h3>
          </div>
          <div className="category" id="lips">
            <img src="/images/img3.jpg" alt="Cosmetic Products" />
            <h3>Rouge à Lèvres</h3>
          </div>
        </div>
      </section>
      <hr className="dividers"></hr>
      <InstaSection />
      <hr className="dividers"></hr>
      <Footer />
    </div>
  );
}

export default Home;
