import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // <-- import useLocation
import { Search } from 'lucide-react';
import '../../styles/categorie.css';
import Footer from '../UI/Footer';
import Header from '../UI/Header';
import api from '../../api';
import Menu from '../UI/Menu';

const ListProduct = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Récupérer category depuis l'URL
  const params = new URLSearchParams(location.search);
  const initialCategory = params.get('category') || 'All';

  // États locaux
  const [products, setProducts] = useState([]);
  const [filteredCategory, setFilteredCategory] = useState(initialCategory);
  const [currentVideo, setCurrentVideo] = useState('/videos/levr.mp4');
  const [searchTerm, setSearchTerm] = useState('');
   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // Quand filteredCategory change, changer la vidéo aussi
  useEffect(() => {
    switch (filteredCategory) {
      case 'Yeux':
        setCurrentVideo('/videos/yeux.mp4');
        break;
      case 'Lèvres':
        setCurrentVideo('/videos/levres.mp4');
        break;
      case 'Teint':
        setCurrentVideo('/videos/teint.mp4');
        break;
      default:
        setCurrentVideo('/videos/levr.mp4');
        break;
    }
  }, [filteredCategory]);

  // Charger les produits
  useEffect(() => {
    api.get('/products/')
      .then(res => setProducts(res.data))
      .catch(err => console.error('Erreur chargement produits :', err));
  }, []);

  // Filtrer les produits
  const filteredProducts = products.filter(p => {
    const matchCategory =
      filteredCategory === 'All' || p.category.toLowerCase() === filteredCategory.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
   <>
   <Header toggleSidebar={toggleSidebar} />
     
      <Menu isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Overlay pour masquer le contenu principal lorsque le sidebar est ouvert */}
      {isSidebarOpen && <div className="overlay" onClick={toggleSidebar}></div>}

  <div className="listproduct">
    <div className="video-banner">
      <video autoPlay muted loop key={currentVideo}>
        <source src={currentVideo} type="video/mp4" />
        Votre navigateur ne supporte pas la vidéo.
      </video>
    </div>

    <div className="top-controls">
      <div className="category-buttons">
        <button onClick={() => setFilteredCategory('All')}><span>Tous</span></button>
        <button onClick={() => setFilteredCategory('Yeux')}><span>Yeux</span></button>
        <button onClick={() => setFilteredCategory('Lèvres')}><span>Lèvres</span></button>
        <button onClick={() => setFilteredCategory('Teint')}><span>Teint</span></button>
      </div>

      <div className="search-wrapper">
        <Search className="search-icon" />
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
    <hr className="dividers"></hr>

    <div className="product-list-container">
      {filteredProducts.length === 0 ? (
        <p>Aucun produit trouvé</p>
      ) : (
        <div className="product-grid">
          {filteredProducts.map(product => (
            <div
              className="product-card"
              key={product.id}
              onClick={() => navigate(`/products/${product.slug}`)}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
              />
              <h3>{product.name}</h3>
              <p>{product.price} DA</p>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
  <Footer />
</>

  );
};

export default ListProduct;
