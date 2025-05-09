import React, { useState } from 'react';
import api from "../../api";

const ProfilEdit = ({ userInfo, onUpdate }) => {
  const [formData, setFormData] = useState({
    nom: userInfo.nom || '',
    prenom: userInfo.prenom || '',
    tel: userInfo.tel || '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      // Vérification que les mots de passe correspondent
      if (formData.newPassword !== formData.confirmPassword) {
        alert("Les mots de passe ne correspondent pas");
        return;
      }

      const token = localStorage.getItem('access_token');
      
      // Mettre à jour les informations de l'utilisateur
      const res = await api.put('update/', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      onUpdate(res.data); // Appel la fonction onUpdate pour mettre à jour le profil

      // Si un changement de mot de passe est demandé, appel de l'API ChangePassword
      if (formData.oldPassword && formData.newPassword) {
        const changePasswordRes = await api.post('change-password/', {
          old_password: formData.oldPassword,
          new_password: formData.newPassword
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        alert(changePasswordRes.data.message); // Affiche le message de succès ou d'erreur
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
    }
  };

  return (
    <form className="personal-info-form">
      <div className="form-group">
        <label>Adresse Email*</label>
        <input type="email" value={userInfo.email} disabled />
      </div>

      <div className="form-group">
        <label>Nom*</label>
        <input
          type="text"
          name="nom"
          value={formData.nom}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Prénom*</label>
        <input
          type="text"
          name="prenom"
          value={formData.prenom}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Téléphone*</label>
        <input
          type="text"
          name="tel"
          value={formData.tel}
          onChange={handleChange}
        />
      </div>

      {/* Champs pour changer le mot de passe */}
      <div className="form-group">
        <label>Ancien mot de passe*</label>
        <input
          type="password"
          name="oldPassword"
          value={formData.oldPassword}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Nouveau mot de passe*</label>
        <input
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Confirmer le mot de passe*</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
        />
      </div>

      <button type="button" className="save-changes-btn" onClick={handleUpdate}>
        Sauvegarder les modifications
      </button>
    </form>
  );
};

export default ProfilEdit;
