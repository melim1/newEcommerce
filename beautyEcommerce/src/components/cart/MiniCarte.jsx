import React, { useEffect, useState } from 'react';
import "../../styles/MiniCarte.css";

const MiniCarte = ({ visible, onClose, items }) => {
    const [isRendered, setIsRendered] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        let autoCloseTimer;
        if (visible && items.length) {
            setIsRendered(true);
            setTimeout(() => {
                setIsOpen(true); // ➕ transition d’ouverture
            }, 10);

            // ✅ Lancer le timer de fermeture automatique
            autoCloseTimer = setTimeout(() => {
                onClose(); // appelle la fonction parent pour cacher
            }, 3000); // 3 secondes
        } else if (isRendered) {
            setIsOpen(false);
            const cleanupTimer = setTimeout(() => {
                setIsRendered(false);
            }, 500); // Attente pour la transition CSS
            return () => clearTimeout(cleanupTimer);
        }

        return () => {
            if (autoCloseTimer) clearTimeout(autoCloseTimer); // ⛔ Nettoyage si on ferme manuellement
        };
    }, [visible, items, isRendered, onClose]);

    if (!isRendered) return null;

    const totalGlobal = items.reduce((acc, item) => acc + item.price * item.quantite, 0);

    return (
        <div className={`mini-cart ${isOpen ? 'open' : 'closed'}`}>
            <button className="close-btn" onClick={onClose}>×</button>

            <div className="mini-cart-content">
                {items.map((item, i) => (
                    <div key={i} className="mini-cart-item">
                        <img src={`http://127.0.0.1:8000${item.image}`} alt={item.name} />
                        <div className="mini-cart-info">
                            <p className="nom">{item.name}</p>
                            <p className="quantité">Quantité : {item.quantite}</p>
                            <p className="total">Total : {item.price * item.quantite} €</p>
                        </div>
                    </div>
                ))}
                <div className="cart-total">
                    <strong className="totale">Total panier : {totalGlobal} €</strong>
                </div>
            </div>
            <button className="continue-btn" onClick={onClose}>Continuer</button>
        </div>
    );
};

export default MiniCarte;
