import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import "../../styles/Register.css";
import Header from "../UI/Header";
import Footer from "../UI/Footer";
import { jwtDecode } from "jwt-decode";
import Menu from "../UI/Menu";

// ✅ Transfert panier visiteur
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };
  
  



  const handleRegister = async (e) => {
    e.preventDefault();

    // ✅ Validation du téléphone
    if (!/^\d{10}$/.test(tel)) {
      setError("Le numéro de téléphone doit contenir exactement 10 chiffres.");
      return;
    }
    if (!/^0[5-7]/.test(tel)) {
      setError("Le numéro de téléphone doit commencer par 05, 06 ou 07.");
      return;
    }

    // ✅ Validation du mot de passe
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    // ✅ Validation email (doit finir par @example.com ou @gmail.com)
    if (!email.match(/^[^\s@]+@(example\.com|gmail\.com)$/)) {
      setError("L'email doit se terminer par @example.com ou @gmail.com.");
      return;
    }

    try {
      // 1. Enregistrement
      await api.post("/api/register/", {
        email,
        password,
        nom,
        prenom,
        tel,
      });

      // 2. Connexion automatique
      const loginResponse = await api.post("/api/token/", { email, password });
      const access = loginResponse.data.access;
      const refresh = loginResponse.data.refresh;

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      const decoded = jwtDecode(access);
      const role = decoded.role;
      localStorage.setItem("user_role", role);

      // 3. Création du client s'il n'existe pas
      if (role === "CLIENT") {
        const cart_code = localStorage.getItem("cart_code");
        await api.post("/create_client_if_not_exists/", { cart_code }, {
          headers: { Authorization: `Bearer ${access}` },
        });

        await transferVisitorCart(access);
        localStorage.removeItem("cart_code");
        console.log("✅ Panier fusionné après inscription.");
      }

      // 4. Redirection vers accueil
      navigate("/");
    } catch (err) {
      console.error("Erreur complète :", err.response?.data || err.message);
      if (err.response?.data) {
        const firstKey = Object.keys(err.response.data)[0];
        const message = err.response.data[firstKey];
        setError(Array.isArray(message) ? message[0] : message);
      } else {
        setError("Erreur lors de l'inscription.");
      }
    }
  };

  return (
    <>
     <div className="register-container">
       <Header toggleSidebar={toggleSidebar} />
     
      <Menu isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Overlay pour masquer le contenu principal lorsque le sidebar est ouvert */}
      {isSidebarOpen && <div className="overlay" onClick={toggleSidebar}></div>}

  <div className="register-box">
    <div className="register-form">
      <h2>créer un compte </h2>
      {error && <div className="error-message">{error}</div>}

     

      <form className="frm" onSubmit={handleRegister}>
        <div className="npt">
        <input type="text" className="input-field" placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
       </div>
        <input type="text" className="input-field" placeholder="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
        <input type="email" className="input-field" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="text" className="input-field" placeholder="Téléphone" value={tel} onChange={(e) => setTel(e.target.value)} required />
        <input type="password" className="input-field" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <button className="register-btn" type="submit">Créer un compte</button>

        
        <div className="login-link">Already have an account? <a href="/login">Log in</a></div>
      </form>
    </div>

    <div className="register-image-section">
       <video
    className="register-video-bg"
    autoPlay
    loop
    muted
    playsInline
  >
    <source src="/images/video9.mp4" type="video/mp4" />
    Your browser does not support the video tag.
  </video>
      <div className="testimonial">
        “Untitled Labs were a breeze to work alongside, we can’t recommend them enough. We launched 6 months earlier than expected and are growing 30% MoM.”
        <div className="testimonial-author">Amélie Laurent – Founder, Sisyphus</div>
      </div>
    </div>
  </div>
</div>

      <Footer />
    </>
  );
};

export default Register;
