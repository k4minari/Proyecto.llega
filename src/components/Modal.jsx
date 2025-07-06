// src/components/Modal.jsx
import React from 'react';
import './Modal.css'; 

const Modal = ({ isOpen, onClose, title, message, children }) => {
  if (!isOpen) return null; // Si no está abierto, no renderiza nada

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Detiene la propagación del clic para que no se cierre al hacer clic dentro del modal */}
        
        <div className="modal-header">
          {title && <h2>{title}</h2>}
          <button className="modal-close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          {message && <p>{message}</p>}
          {children} {/* Permite pasar contenido personalizado al modal */}
        </div>
        
        <div className="modal-footer">
          {/* Aquí podrías añadir botones de acción si los necesitas, ej. "Aceptar", "Cancelar" */}
        </div>
      </div>
    </div>
  );
};

export default Modal;