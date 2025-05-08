import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api';
import '../../styles/Confirmation.css';
import Header from "../UI/Header";
import Footer from "../UI/Footer";


const Confirmation = () => {
  const { commande_id } = useParams();
  const [commande, setCommande] = useState(null);

  useEffect(() => {
    const fetchCommande = async () => {
      try {
        const res = await api.get(`commande/${commande_id}/`);
        setCommande(res.data);
      } catch (err) {
        console.error(err);
        alert("Erreur lors de la récupération de la commande.");
      }
    };

    if (commande_id) {
      fetchCommande();
    }
  }, [commande_id]);

  if (!commande) {
    return <p>Chargement...</p>;
  }

  const totalLignes = commande.lignes?.reduce((acc, ligne) => acc + ligne.quantite * ligne.prixUnitaire, 0);

  return (
   <>
   <Header />
    <div className="confirmation-container">
      
      <h2>Commande Confirmée</h2>
      <p><strong className="commande">ID de la commande :</strong> {commande.id}</p>
      <p><strong className="commande">Montant total :</strong> ${Number(commande.montantTotal).toFixed(2)}</p>
      <p><strong className="commande">Statut :</strong> {commande.statut}</p>
      <p><strong className="commande">Date :</strong> {new Date(commande.dateCommande).toLocaleString()}</p>

      <h3>Détails de la commande</h3>
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

      <p className="commande-total">
        <strong className="commande-total">Total :</strong> ${totalLignes?.toFixed(2)}
      </p>
    </div>
    <Footer/>
    </>
  );
};

export default Confirmation;
