import React, { useEffect, useState } from 'react';
import api from '../../api';
import "../../styles/GestionCommande.css";
import { useNavigate } from 'react-router-dom';

const GestionCommande = () => {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('api/admin/commandes/')
      .then(res => {
        console.log("Réponse commandes :", res.data); // 👀
        setCommandes(res.data);
        setLoading(false);
      })
      .catch(err => {
        setErreur("Erreur lors du chargement des commandes");
        setLoading(false);
      });
  }, []);

  const changerStatut = (commandeId, nouveauStatut) => {
    api.patch(`api/admin/commandes/${commandeId}/status/`, { statut: nouveauStatut })
      .then(res => {
        // Met à jour localement le statut
        setCommandes(prev =>
          prev.map(cmd =>
            cmd.id === commandeId ? { ...cmd, statut: nouveauStatut } : cmd
          )
        );
      })
      .catch(err => {
        setErreur("Erreur lors de la mise à jour du statut");
      });
  };

  if (loading) return <p>Chargement des commandes...</p>;
  if (erreur) return <p style={{ color: 'red' }}>{erreur}</p>;

  return (
    <div className="commande-container">
      <h2>Gestion des Commandes</h2>
      <table className="commande-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Client</th>
            <th>Total</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {commandes.map(commande => (
            <tr key={commande.id}>
              <td>{commande.id}</td>
              <td>{commande.client?.utilisateur?.prenom} {commande.client?.utilisateur?.nom}</td>
              <td>{commande.total} €</td>
              <td className={`statut ${commande.statut.toLowerCase()}`}>{commande.statut}</td>
              <td  className="actions">
                <button onClick={() => changerStatut(commande.id, 'VALIDÉE')}>Validée</button>
                <button onClick={() => changerStatut(commande.id, 'EXPÉDIÉ')}>Expédiée</button>
                <button onClick={() => changerStatut(commande.id, 'ANNULÉE')}>Annulée</button>
                <button className="details-button" onClick={() => window.location.href = `/commande/${commande.id}`}>Voir details</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GestionCommande;
