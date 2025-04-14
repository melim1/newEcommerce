import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api';
import Header from '../UI/Header';
import Footer from '../UI/Footer';
import "../../styles/CommandeDetails.css";

const CommandeDetails = () => {
  const { id } = useParams();
  const [commande, setCommande] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/commande/${id}/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      }
    })
    .then(res => {
      setCommande(res.data);
      setLoading(false);
    })
    .catch(err => {
      console.error("Erreur lors de la récupération des détails de la commande", err);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <p>Chargement...</p>;
  if (!commande) return <p>Commande introuvable.</p>;

  return (
    <>
      <Header />
      <div className="commande-details-container">
        <h1>Détails de la commande #{commande.id}</h1>
        <p><strong>Date :</strong> {new Date(commande.dateCommande).toLocaleDateString()}</p>
        <p><strong>Statut :</strong> {commande.statut}</p>
        <p><strong>Montant Total :</strong> {Number(commande.montantTotal).toFixed(2)} €</p>

        <h2>Produits</h2>
        
      <ul className="commande-lignes">
        {commande.lignes?.map((ligne) => (
          <li key={ligne.produit.id} className="ligne-item">
            <img 
              src={`http://127.0.0.1:8000${ligne.produit.image}`} 
              alt={ligne.produit.name} 
              className="produit-img"
            />
            <div className="details">
              <p ><strong  className="commande">{ligne.produit.name}</strong></p>
              <p >{ligne.quantite} × ${Number(ligne.prixUnitaire).toFixed(2)} = <strong className="commande">${(ligne.quantite * ligne.prixUnitaire).toFixed(2)}</strong></p>
            </div>
          </li>
        ))}
      </ul>

      
      </div>
      <Footer />
    </>
  );
};

export default CommandeDetails;
