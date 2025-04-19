import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import "../../styles/Register.css";
import Header from "../UI/Header";
import Footer from "../UI/Footer";
import { jwtDecode } from "jwt-decode";

// ✅ Fonction utilitaire pour transférer le panier visiteur
const transferVisitorCart = async (token) => {
  const sessionId = localStorage.getItem("session_id");
  const visitorCart = JSON.parse(localStorage.getItem("visitor_cart")) || [];

  if (!sessionId || visitorCart.length === 0) return;

  try {
    await api.post("transfer_visitor_cart/", {
      session_id: sessionId,
      items: visitorCart,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    localStorage.removeItem("visitor_cart");
    localStorage.removeItem("session_id");
    console.log("✅ Panier visiteur transféré avec succès !");
  } catch (error) {
    console.error("❌ Erreur transfert panier :", error.response?.data || error.message);
  }
};

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
      // 1. Création du compte
      await api.post("/api/register/", {
        email,
        password,
        nom,
        prenom,
        tel,
      });

      // 2. Connexion automatique après inscription
      const loginResponse = await api.post("/api/token/", { email, password });

      const access = loginResponse.data.access;
      const refresh = loginResponse.data.refresh;

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
        const cart_code = localStorage.getItem("cart_code");
        await api.post("/create_client_if_not_exists/", { cart_code }, config);

        await transferVisitorCart(access);

        localStorage.removeItem("cart_code");
        console.log("✅ Panier fusionné après inscription.");
      }

      // Redirection après inscription
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'inscription");
    }
  };

  return (
    <>
      <div className="register-container">
        <Header />
        {/* Onglets connexion & inscription */}
        <div className="tabs">
          <span onClick={() => navigate("/login")}>SE CONNECTER</span>
          <span className="active" onClick={() => navigate("/register")}>
            CRÉER UN COMPTE
          </span>
        </div>
        <p>Enter your login details</p>

        <div className="register-box">
          {error && <p style={{ color: "red" }}>{error}</p>}
          <form onSubmit={handleRegister}>
            <input
              type="text"
              className="input-field"
              placeholder="Nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
            />
            <input
              type="text"
              className="input-field"
              placeholder="Prénom"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              required
            />
            <input
              type="email"
              className="input-field"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="text"
              className="input-field"
              placeholder="Téléphone"
              value={tel}
              onChange={(e) => setTel(e.target.value)}
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
            <button className="register-btn" type="submit">
              S'inscrire
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Register;
