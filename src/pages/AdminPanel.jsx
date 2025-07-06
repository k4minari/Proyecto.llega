// src/pages/AdminPanel.jsx
import React, { useState } from 'react';
// Importamos los componentes de gestión que acabamos de crear
import TicketManager from '../components/TicketManager';
import SpaceManager from '../components/SpaceManager';
// Añade estos estilos a src/App.css si no los tienes
import './AdminPanel.css'; // Crearemos este archivo para los estilos

const AdminPanel = () => {
  const [activeView, setActiveView] = useState('spaces'); // Empezamos en 'spaces' por defecto

  return (
    <div className="page-container">
      <h1 className="page-title">Panel de Administración</h1>
      <div className="admin-nav">
        <button onClick={() => setActiveView('tickets')} className={activeView === 'tickets' ? 'active' : ''}>Gestionar Tickets</button>
        <button onClick={() => setActiveView('spaces')} className={activeView === 'spaces' ? 'active' : ''}>Gestionar Espacios</button>
      </div>
      <div className="admin-content">
        {/* Aquí mostramos el componente correspondiente */}
        {activeView === 'tickets' && <TicketManager />}
        {activeView === 'spaces' && <SpaceManager />}
      </div>
    </div>
  );
};

export default AdminPanel;