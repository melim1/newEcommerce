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
                setIsOpen(true);
            }, 10);

            autoCloseTimer = setTimeout(() => {
                onClose();
            }, 3000);
        } else if (isRendered) {
            setIsOpen(false);
            const cleanupTimer = setTimeout(() => {
                setIsRendered(false);
            }, 500);
            return () => clearTimeout(cleanupTimer);
        }

        return () => {
            if (autoCloseTimer) clearTimeout(autoCloseTimer);
        };
    }, [visible, items, isRendered, onClose]);

    if (!isRendered) return null;

    const totalGlobal = items.reduce(
        (acc, item) => acc + item.product.price * item.quantity,
        0
    );

    return (
        <div className={`mini-cart ${isOpen ? 'open' : 'closed'}`}>
            <button className="close-btn" onClick={onClose}></button>

            <div className="mini-cart-content">
                {items.map((item, i) => (
                    <div key={i} className="mini-cart-item">
                        <img src={`http://127.0.0.1:8000${item.product.image}`} alt={item.product.name} />
                        <div className="mini-cart-info">
                            <p className="nom">{item.product.name}</p>
                            <p className="quantité">Quantité : {item.quantity}</p>
                            <p className="total">Total : {item.product.price * item.quantity} €</p>
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
