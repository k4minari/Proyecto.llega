// src/pages/Home.jsx

import React from 'react';
import React, { useState } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth'; // Importamos el hook para saber si el usuario es invitado
import Modal from '../components/Modal'

// Componente reutilizable para las tarjetas
const SpaceTypeCard = ({ title, description, imageUrl, onClick }) => (
  <div className="space-card">
    <img src={imageUrl} alt={title} className="space-card-img" />
    <div className="space-card-body">
      <h4>{title}</h4>
      <p>{description}</p>
      <button onClick={onClick} className="btn-secondary" style={{backgroundColor: '#007bff', color: 'white'}}>Ir a espacios {title.toLowerCase()}</button>
    </div>
  </div>
);

const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Obtenemos el usuario para mostrar botones diferentes

  const [showGuestModal, setShowGuestModal] = useState(false); // Para el invitado
  const [showFutureFeatureModal, setShowFutureFeatureModal] = useState(false); // Para funcionalidad futura

  const handleViewSpacesClick = () => {
    if (currentUser) {
      // Si el usuario está registrado, mostramos el modal de "funcionalidad futura"
      setShowFutureFeatureModal(true);
    } else {
      // Si es un invitado, mostramos el modal de "iniciar sesión"
      setShowGuestModal(true);
    }
  };

  // Función para manejar el cierre del modal de invitado
  const handleGuestModalClose = () => {
    setShowGuestModal(false);
    navigate('/login'); // Redirige al login después de que el usuario cierre el modal
  };

  // Función para manejar el cierre del modal de funcionalidad futura
  const handleFutureFeatureModalClose = () => {
    setShowFutureFeatureModal(false);
    // Podrías añadir lógica adicional aquí si es necesario
  };


  return (
    <div className="home-container">
      {/* --- Encabezado --- */}
      <header className="home-header">
        <h1 className="logo" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>llega</h1>
        <nav>
          {/* Los enlaces que son visibles para todos */}
        </nav>
        {/* Mostramos botones diferentes dependiendo si el usuario ha iniciado sesión */}
        {currentUser ? (
          <button onClick={() => navigate('/profile')} className="btn-profile">Perfil</button>
        ) : (
          <div>
            <button onClick={() => navigate('/register')} className="btn-primary" style={{width: 'auto', padding: '8px 15px'}}>Crear Cuenta</button>
            <button onClick={() => navigate('/login')} style={{marginLeft: '10px', background: 'transparent', border: '1px solid black', color: 'black', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer'}}>Iniciar Sesión</button>
          </div>
        )}
      </header>
      
      <main>
        {/* --- Sección Hero con Buscador --- */}
        <section className="hero-section" style={{backgroundImage: "url('https://i.imgur.com/G5gE3jH.png')", backgroundPosition: 'center', backgroundSize: 'cover'}}>
          <div className="logo-circulo" style={{background: 'white', borderRadius: '50%', padding: '20px', marginBottom: '20px'}}>
             <h1 className="logo" style={{fontSize: '3rem', color: 'black'}}>llega</h1>
          </div>
          <h2>Llega al espacio que quieras</h2>
          <div className="search-bar">
            <input type="text" placeholder="¿Qué espacio buscas?" />
            <button className="btn-primary" style={{width: 'auto'}}>Filtrar Búsqueda</button>
          </div>
        </section>

        {/* --- Sección Tipos de Espacios --- */}
        <section className="spaces-section">
          <h3>Nuestros tipos de espacios:</h3>
          <div className="spaces-grid">
            <SpaceTypeCard 
              title="Educativos" 
              description="Espacios destinados a la practica educativa, exposiciones y al estudio, como por ejemplo aulas de clases." 
              imageUrl="https://i.imgur.com/4l3iXqg.jpeg"
              onClick={handleViewSpacesClick} 
            />
            <SpaceTypeCard 
              title="Deportivos" 
              description="Terrenos o canchas donde desempeñar distintas diciplinas deportivas dependiendo del espacio." 
              imageUrl="https://i.imgur.com/fVskMvj.jpeg"
              onClick={handleViewSpacesClick} 
            />
          </div>
        </section>
      </main>

      {/* --- Pie de Página --- */}
      <footer className="home-footer">
        <p>© 2025 Universidad Metropolitana. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default Home;