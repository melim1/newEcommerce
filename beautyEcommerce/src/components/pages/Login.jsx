import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { jwtDecode } from "jwt-decode";
import "../../styles/Login.css";
import Header from "../UI/Header";
import Footer from "../UI/Footer";
import { v4 as uuidv4 } from "uuid";
import Menu from "../UI/Menu";

// ✅ Transfert du panier visiteur
const transferVisitorCart = async (token) => {
  const sessionId = localStorage.getItem("session_id");
  const visitorCart = JSON.parse(localStorage.getItem("visitor_cart")) || [];

  if (!sessionId || visitorCart.length === 0) return;

  try {
    await api.post(
      "transfer_visitor_cart/",
      {
        session_id: sessionId,
        items: visitorCart,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    localStorage.removeItem("visitor_cart");
    localStorage.removeItem("session_id");
    console.log("✅ Panier visiteur transféré avec succès !");
  } catch (error) {
    console.error("Erreur transfert panier :", error.response?.data || error.message);
  }
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

const toggleSidebar = () => {
  setIsSidebarOpen((prev) => !prev);
};



  const handleLogin = async (e) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setError("");

      let hasError = false;
    // Validation email
    if (!email.match(/^[^\s@]+@(example\.com|gmail\.com)$/)) {
     setEmailError("L'email doit se terminer par @example.com ou @gmail.com.");
        hasError = true;
    }

    // Validation mot de passe
    if (password.length < 8) {
      setPasswordError("Le mot de passe doit contenir au moins 8 caractères.");
       hasError = true;
    } if (hasError) return;
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
            const cart_code = localStorage.getItem("cart_code");
            await api.post("/create_client_if_not_exists/", { cart_code }, config);

            // ✅ Transfert du panier visiteur vers client
            await transferVisitorCart(access);

            localStorage.removeItem("cart_code");
            console.log("🛒 Panier fusionné avec succès.");
          } catch (error) {
            console.error("Erreur lors de la création/fusion client :", error);
          }
        }

        // 🔁 Redirection après login
        const redirectTo = localStorage.getItem("redirect_after_login");

        if (redirectTo) {
          navigate(redirectTo);
          localStorage.removeItem("redirect_after_login");
        } else {
          if (role === "ADMIN") {
            navigate("/admin/dashboard");
          } else {
            navigate("/");
          }
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
     <div className="register-container">
      <Header toggleSidebar={toggleSidebar} />
     
      <Menu isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Overlay pour masquer le contenu principal lorsque le sidebar est ouvert */}
      {isSidebarOpen && <div className="overlay" onClick={toggleSidebar}></div>}

  <div className="register-box">
    <div className="register-form">
      <h2>Connectez-vous à votre espace </h2>
      {(emailError || passwordError || error) && (
  <div className="error-message">
    {emailError || passwordError || error}
  </div>
)}
    

     

      <form className="frm" onSubmit={handleLogin}>
        <input type="email" className="input-field" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <input type="password" className="input-field" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
     

        <button className="register-btn" type="submit">Se connecter</button>

        
        <div className="login-link"> Vous n'avez pas encore de compte ?
              <a href="/register"> Inscrivez-vous</a> </div>
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






export default Login;
