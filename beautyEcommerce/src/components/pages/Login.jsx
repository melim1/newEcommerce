import React from 'react'
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api"
import { jwtDecode } from 'jwt-decode';
import "../../styles/Login.css";
import Header from '../UI/Header';
import Footer from '../UI/Footer';


const Login = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
  
   const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const response = await api.post("/api/token/", { email, password });

    if (response.data.access && response.data.refresh) {
      const access = response.data.access;
      const refresh = response.data.refresh;

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      const decoded = jwtDecode(access);
      const role = decoded.role;

      localStorage.setItem("user_role", role);

      const config = {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      };

      if (role === "CLIENT") {
        try {
          // ✅ Fusion panier visiteur -> client
          const cart_code = localStorage.getItem("cart_code");

          await api.post("/create_client_if_not_exists/", { cart_code }, config);

          // ✅ Nettoyage : on supprime le panier visiteur
          localStorage.removeItem("cart_code");

          console.log("Client vérifié/créé et panier fusionné.");
        } catch (error) {
          console.error("Erreur lors de la création/fusion client :", error);
        }
      }

      console.log("Rôle reçu:", role);

      // Redirection selon le rôle
      if (role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }

    } else {
      setError("Les informations d'identification sont incorrectes.");
    }
  } catch (err) {
    console.log(err);
    setError("Email ou mot de passe incorrect");
  }
};

    
    
  return (
    <>
    <div className="login-container">
        
         {/* Onglets connexion & inscription */}
      <div className="tabs">
        <span className="active"  onClick={() => navigate('/login')}>SE CONNECTER</span>
        <span  onClick={() => navigate('/register')}>CRÉER UN COMPTE</span>
      </div>
      <p>Enter your login details</p> 
    <div className="login-box">
       

      
  {error && <p style={{ color: "red" }}>{error}</p>}
  <form onSubmit={handleLogin}>
    <input
      type="email"
      className="input-field"
      placeholder="Renseignez votre adresse email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />
    <input
      type="password"
      className="input-field"
      placeholder="Mot de passe"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />
    <button className="login-btn" type="submit">Se connecter</button>
    <p className="forgot-password">Mot De Passe Oublié?</p>
  </form>
</div>
</div>
</>
  )
}

export default Login