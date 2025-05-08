import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ClientAdminDashboard.css';  // Importation du fichier CSS

const API_BASE_URL = 'http://localhost:8000'; // Ton backend Django

const ClientAdminDashboard = () => {
  const [clients, setClients] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [role, setRole] = useState('client');

  useEffect(() => {
    reloadData();
  }, []);

  const reloadData = () => {
    axios.get(`${API_BASE_URL}/clients_admins/`)
      .then(response => {
        setClients(response.data.clients || []);
        setAdmins(response.data.admins || []);
      })
      .catch(error => console.error('Erreur de récupération des utilisateurs', error));
  };

  const handleDelete = async (id) => {
    try {
      const url = `${API_BASE_URL}/${role === 'client' ? `delete_client/${id}/` : `delete_admin/${id}/`}`;
      await axios.delete(url);
      alert('Supprimé avec succès');
      reloadData();
    } catch (error) {
      console.error('Erreur lors de la suppression', error);
    }
  };

  const dataToDisplay = role === 'client' ? clients : admins;

  return (
    <div className="dashboard-container">
      <div className="content-wrapper">
        <h1 className="title">Gestion des Utulisateurs</h1>

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

        <h2 className="list-title">{role === 'client' ? 'Liste des Clients' : 'Liste des Administrateurs'}</h2>

        <div className="user-list">
          {dataToDisplay.map((item) => (
            <div key={item.utilisateur.id} className="user-card">
              <div className="user-info">
                <div className="user-name">{item.utilisateur.nom} {item.utilisateur.prenom}</div>
                <div className="user-email">{item.utilisateur.email}</div>
                <div className="user-phone">{item.utilisateur.tel}</div>
              </div>

              <div className="action-buttons">
                <button 
                  onClick={() => handleDelete(item.utilisateur.id)} 
                  className="delete-button"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientAdminDashboard;
