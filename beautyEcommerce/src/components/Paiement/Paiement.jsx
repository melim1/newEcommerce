import React, { useState } from 'react';
import api from '../../api';
import { useParams ,useNavigate} from 'react-router-dom';
import '../../styles/paiement.css';
import Header from "../UI/Header";
import Footer from "../UI/Footer";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaCheckCircle } from 'react-icons/fa';

const Paiement = () => {
  const [carteNum, setCarteNum] = useState('');
  const [carteExpiration, setCarteExpiration] = useState('');
  const [carteCvv, setCarteCvv] = useState('');
  const [methode, setMethode] = useState('CB');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { commandeId, montant } = useParams();
  const navigate = useNavigate();

  const handlePayment = async (e) => {
    e.preventDefault();

    try {
      console.log("Envoi du paiement avec : ", {
        commande_id: commandeId,
        montant: parseFloat(montant),
        methode,
        carte_numero: carteNum,
        carte_expiration: carteExpiration + "-01",
        carte_cvv: carteCvv,
      });
      
      const response = await api.post(
        `/paiement/`,
        {
          commande_id: commandeId,
          montant: parseFloat(montant),
          methode: methode,
          carte_numero: carteNum,
          carte_expiration: carteExpiration + "-01", // format yyyy-MM-dd
          carte_cvv: carteCvv,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );

      // Affichage de la notification de succès avec l'icône noire
      toast.success('Paiement effectué avec succès !', {
        icon: <FaCheckCircle style={{ color: 'black', fontSize: '24px' }} /> // Icône noire
      });
      
      // 🔁 Redirection après 2 secondes
      setTimeout(() => {
        navigate(`/confirmation/${commandeId}`);
      }, 2000);

    } catch (error) {
      console.error(error.response?.data || error.message); 
      // Affichage de la notification d'erreur
      toast.error('Échec du paiement, veuillez réessayer.');
    }
  };

  return (
    <div className="paiement-page">
      <Header/>
      <div className="paiement-container">
        <h3>Paiement de la commande</h3>
        <form onSubmit={handlePayment}>
          <div className='num-carte'>
            <label htmlFor="carte_numero">Numéro de carte :</label>
            <input
              type="text"
              id="carte_numero"
              value={carteNum}
              onChange={(e) => setCarteNum(e.target.value)}
              required
            />
          </div>
          <div className='date-exp'>
            <label htmlFor="carte_expiration">Date d'expiration :</label>
            <input
              type="month"
              id="carte_expiration"
              value={carteExpiration}
              onChange={(e) => setCarteExpiration(e.target.value)}
              required
            />
          </div>
          <div className='cvv'>
            <label htmlFor="carte_cvv">CVV :</label>
            <input
              type="text"
              id="carte_cvv"
              value={carteCvv}
              onChange={(e) => setCarteCvv(e.target.value)}
              required
            />
          </div>
          <div>
            <button type="submit">Payer</button>
          </div>
        </form>
      </div>
      <Footer/>
      
      {/* Toast container */}
      <ToastContainer />
    </div>
  );
};

export default Paiement;
