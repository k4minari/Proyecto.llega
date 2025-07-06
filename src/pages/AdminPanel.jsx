// src/pages/AdminPanel.jsx
import React, { useState } from 'react';
// Importaremos los componentes de gestión que crearemos a continuación
// import TicketManager from '../components/TicketManager';
// import SpaceManager from '../components/SpaceManager';

const AdminPanel = () => {
  const [activeView, setActiveView] = useState('tickets'); // 'tickets' o 'spaces'

  return (
    <div className="page-container">
      <h1 className="page-title">Panel de Administración</h1>
      <div className="admin-nav">
        <button onClick={() => setActiveView('tickets')} className={activeView === 'tickets' ? 'active' : ''}>Gestionar Tickets</button>
        <button onClick={() => setActiveView('spaces')} className={activeView === 'spaces' ? 'active' : ''}>Gestionar Espacios</button>
      </div>
      <div className="admin-content">
        {/* Aquí mostraremos el componente correspondiente */}
        {activeView === 'tickets' && <p>Aquí irá el gestor de tickets.</p> /* <TicketManager /> */}
        {activeView === 'spaces' && <p>Aquí irá el gestor de espacios.</p> /* <SpaceManager /> */}
      </div>
    </div>
  );
};

export default AdminPanel;

// Añade estos estilos a src/App.css
/*
.admin-nav {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 10px;
}
.admin-nav button {
  padding: 10px 15px;
  border: 1px solid var(--border-color);
  background: var(--white);
  cursor: pointer;
  border-radius: 4px;
}
.admin-nav button.active {
  background: var(--primary-dark);
  color: var(--white);
  border-color: var(--primary-dark);
}
*/