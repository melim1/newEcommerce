import React, { useState } from 'react';
import api from '../../api';
import { useParams, useNavigate } from 'react-router-dom';
import '../../styles/paiement.css';
import Header from "../UI/Header";
import Footer from "../UI/Footer";

const Paiement = () => {
  const [carteNum, setCarteNum] = useState('');
  const [carteExpiration, setCarteExpiration] = useState('');
  const [carteCvv, setCarteCvv] = useState('');
  const [methode, setMethode] = useState('CB');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { commandeId, montant } = useParams();
  const navigate = useNavigate();

  // Validation : numéro de carte = 16 chiffres
  const isValidCardNumber = (number) => {
    return /^\d{16}$/.test(number);
  };

  // Validation : CVV = 3 chiffres
  const isValidCVV = (cvv) => {
    return /^\d{3}$/.test(cvv);
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!isValidCardNumber(carteNum)) {
      setErrorMessage('Le numéro de carte doit contenir exactement 16 chiffres.');
      setSuccessMessage('');
      return;
    }

    if (!isValidCVV(carteCvv)) {
      setErrorMessage('Le CVV doit contenir exactement 3 chiffres.');
      setSuccessMessage('');
      return;
    }

    try {
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

      setSuccessMessage('✅ Paiement effectué avec succès !');
      setErrorMessage('');

      // Redirection après 2 secondes
      setTimeout(() => {
        navigate(`/confirmation/${commandeId}`);
      }, 2000);

    } catch (error) {
      console.error(error.response?.data || error.message);
      setErrorMessage('❌ Échec du paiement, veuillez réessayer.');
      setSuccessMessage('');
    }
  };

  return (
    <div className="paiement-page">
      <Header />
      <div className="paiement-container">
        <h3>Paiement de la commande</h3>

        {successMessage && (
          <div style={{ color: 'green', marginTop: '10px', fontWeight: 'bold' }}>
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div style={{ color: 'red', marginTop: '10px' }}>
            {errorMessage}
          </div>
        )}

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
      <Footer />
    </div>
  );
};

export default Paiement;
