import React from 'react'
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api"
import "../../styles/Register.css";
import Header from '../UI/Header';
import Footer from '../UI/Footer';

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nom, setNom] = useState("");
    const [prenom, setPrenom] = useState("");
    const [tel, setTel] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
  
    const handleRegister = async (e) => {
      e.preventDefault();
      try {
        await api.post("/api/register/", { email, password, nom, prenom,tel });
        navigate("/login");
      } catch (err) {
        setError("Erreur lors de l'inscription");
      }
    };
  return (
    <>
    <div className='register-container'>
       <Header />
         {/* Onglets connexion & inscription */}
         <div className="tabs">
        <span   onClick={() => navigate('/login')}>SE CONNECTER</span>
        <span className="active" onClick={() => navigate('/register')}>CRÉER UN COMPTE</span>
      </div>
      <p>Enter your login details</p> 

    <div className="register-box">
    {error && <p style={{ color: "red" }}>{error}</p>}
    <form onSubmit={handleRegister}>
      <input type="text"  className="input-field" placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
      <input type="text"  className="input-field" placeholder="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
      <input type="email"  className="input-field" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="text"  className="input-field" placeholder="Téléphone" value={tel} onChange={(e) => setTel(e.target.value)} required />
      <input type="password"  className="input-field" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <button  className="register-btn" type="submit">S'inscrire</button>
    </form>
   
  </div>
 
  </div>
  <Footer/>
  </>
  )
}

export default Register