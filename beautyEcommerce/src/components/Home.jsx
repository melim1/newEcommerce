import '../styles/styles.css';
import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import Footer from './UI/Footer';
import InstaSection from './UI/InstaSection';
import Header from './UI/Header';
import Menu from './UI/Menu';

function Home() {
  const [products, setProducts] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Ajout de l'état pour le sidebar

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

  return (
    <div className="landing-page">
      {/* Passer les props pour gérer l'état du sidebar */}
      <Header toggleSidebar={toggleSidebar} />
     
      <Menu isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Overlay pour masquer le contenu principal lorsque le sidebar est ouvert */}
      {isSidebarOpen && <div className="overlay" onClick={toggleSidebar}></div>}

      {/* Banner */}
      <section className="banner">
  <video
    className="banner-video"
    autoPlay
    loop
    muted
    playsInline
  >
    <source src="/images/video.mp4" type="video/mp4" />
    Votre navigateur ne supporte pas la lecture vidéo.
  </video>


</section>

      <hr className="dividers"></hr>
    

      {/* Most Wanted */}
      <section className="most-wanted">
      <p className="title">MORE OF</p>
        <h3>RosaLuminosa</h3>
        <div className="products">
          {products.slice(0, 4).map(product => (
            <div key={product.id} className="product-card">
              <Link to={`products/${product.slug}`} className="product-link">
              
                  <img
                    src={product.image}
                    alt={product.name}
                  />
                
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
        <h2>Shop by Category</h2>
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
