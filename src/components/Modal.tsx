import React from 'react';

interface ModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    promoCode?: string;
    onClose: () => void;
    actionLabel: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, title, message, promoCode, onClose, actionLabel }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="modal-title">{title}</h2>
                <p className="modal-message">{message}</p>

                {promoCode && (
                    <div className="promo-container">
                        <p className="promo-label">Ваш промокод:</p>
                        <p className="promo-code">{promoCode}</p>
                    </div>
                )}

                <button onClick={onClose} className="btn-primary">
                    {actionLabel}
                </button>
            </div>
        </div>
    );
};

export default Modal;
