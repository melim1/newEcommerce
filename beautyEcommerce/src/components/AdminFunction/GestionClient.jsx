import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ClientAdminDashboard.css';

const API_BASE_URL = 'http://localhost:8000';

const ClientAdminDashboard = () => {
  const [clients, setClients] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [role, setRole] = useState('client');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    reloadData();
  }, []);

  const reloadData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/clients_admins/`);
      console.log("Données complètes reçues:", response.data);

      // Traitement des données pour s'assurer que chaque entité a un ID
      const processedClients = (response.data.clients || []).map(client => ({
        ...client,
        id: client.id,
        utilisateur: {
          ...client.utilisateur,
          id: client.utilisateur.id
        }
      }));

      const processedAdmins = (response.data.admins || []).map(admin => ({
        ...admin,
        id: admin.id,
        utilisateur: {
          ...admin.utilisateur,
          id: admin.utilisateur.id
        }
      }));

      setClients(processedClients);
      setAdmins(processedAdmins);
    } catch (error) {
      console.error('Erreur de récupération des utilisateurs', error);
      alert('Erreur lors du chargement des données: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, userData) => {
    console.log("Suppression de l'entité ID:", id);

    if (!id) {
      alert("ID utilisateur manquant, suppression impossible.");
      return;
    }

    const confirm = window.confirm(
      `Êtes-vous sûr de vouloir supprimer ${userData.nom} ${userData.prenom} (${userData.email}) ?`
    );
    if (!confirm) return;

    try {
      const endpoint = role === 'client' ? 'delete_client' : 'delete_admin';
      const response = await axios.delete(`${API_BASE_URL}/${endpoint}/${id}/`);

      if (response.status === 204) {
        alert(`${role === 'client' ? 'Client' : 'Administrateur'} supprimé avec succès`);
        reloadData();
      } else {
        alert(`Réponse inattendue: ${response.status}`);
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      let errorMessage = 'Erreur inconnue lors de la suppression';
      if (error.response) {
        errorMessage = error.response.data?.error || error.response.data?.message || JSON.stringify(error.response.data);
      } else if (error.request) {
        errorMessage = "Pas de réponse du serveur";
      } else {
        errorMessage = error.message;
      }
      alert(`Échec de la suppression: ${errorMessage}`);
    }
  };

  const dataToDisplay = role === 'client' ? clients : admins;

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="content-wrapper">
          <h1 className="title">Chargement en cours...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="content-wrapper">
        <h1 className="title">Gestion des Utilisateurs</h1>

        <div className="role-selector">
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)} 
            className="role-dropdown"
          >
            <option value="client">Clients</option>
            <option value="admin">Administrateurs</option>
          </select>
        </div>

        <h2 className="list-title">
          {role === 'client' ? 'Liste des Clients' : 'Liste des Administrateurs'}
          <span className="count-badge">({dataToDisplay.length})</span>
        </h2>

        {dataToDisplay.length === 0 ? (
          <div className="no-users-message">
            Aucun {role === 'client' ? 'client' : 'administrateur'} trouvé
          </div>
        ) : (
          <div className="user-list">
            {dataToDisplay.map((item) => {
              const user = item.utilisateur || item;
              const entityId = item.id;

              return (
                <div 
                  key={entityId || `temp-${Math.random().toString(36).substr(2, 9)}`} 
                  className="user-card"
                >
                  <div className="user-info">
                    <div className="user-name">
                      {user.nom} {user.prenom}
                      {entityId ? (
                        <span className="user-id">ID: {entityId}</span>
                      ) : (
                        <span className="user-id-warning">(ID manquant)</span>
                      )}
                    </div>
                    <div className="user-email">{user.email}</div>
                    <div className="user-phone">{user.tel}</div>
                  </div>

                  <div className="action-buttons">
                    <button 
                      onClick={() => handleDelete(entityId, user)} 
                      className="delete-button"
                      disabled={!entityId}
                      title={!entityId ? "Impossible de supprimer sans ID" : ""}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientAdminDashboard;
