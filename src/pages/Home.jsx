// src/pages/Home.jsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { auth } from '../firebase/config'; // <-- 1. Importamos `auth`
import { signOut } from 'firebase/auth';   // <-- 2. Importamos la función `signOut`
import useAdminStatus from '../hooks/useAdminStatus'; // <-- 1. Importamos el hook

// 1. Importamos TODAS las imágenes que usaremos
import heroBackground from '../assets/UNIMET.jpg';
import educativosImage from '../assets/lab.jpg';
import deportivosImage from '../assets/Selecciones-deportivas.jpg';
import logoUnimet from '../assets/Logo-UNIMET-color-300-dpi.jpg';
import centroMundoXImage from '../assets/Centro-Mundo-X.jpg';
// Asumimos que tienes una imagen para Auditorios y Oficinas, si no, puedes repetir una.
import auditoriosImage from '../assets/auditorio.jpg'; // Reemplaza con una imagen real
import oficinasImage from '../assets/oficinas-placeholder.jpg';   // Reemplaza con una imagen real


// Componente reutilizable para las tarjetas
const SpaceTypeCard = ({ title, description, imageUrl, onClick }) => (
  <div className="space-card" onClick={onClick} style={{cursor: 'pointer'}}>
    <img src={imageUrl} alt={title} className="space-card-img" />
    <div className="space-card-body">
      <h4>{title}</h4>
      <p>{description}</p>
      <button className="btn-secondary" style={{backgroundColor: '#007bff', color: 'white'}}>Ir a espacios</button>
    </div>
  </div>
);


const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
   const { isAdmin } = useAdminStatus(currentUser); // <-- 2. Usamos el hook

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Después de cerrar sesión, redirigimos al usuario a la página de inicio
      navigate('/');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("Hubo un problema al cerrar tu sesión. Por favor, inténtalo de nuevo.");
    }
  };

  const handleViewSpacesClick = (spaceCategory) => {
    if (currentUser) {
      alert(`Navegando a la categoría "${spaceCategory}" (funcionalidad futura).`);
    } else {
      alert("Para ver los detalles y reservar, primero necesitas iniciar sesión.");
      navigate('/login');
    }
  };

  return (
    <div className="home-container">
      {/* --- Encabezado --- */}
      <header className="home-header">
        <h1 className="logo" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>llega</h1>
        <nav>
          <Link to="/">Inicio</Link>
          <Link to="/categories">Categorías</Link>
          {currentUser && <Link to="/my-reservations">Mis Reservas</Link>}
        </nav>
          {currentUser ? (
              <div className="user-actions">
                  {isAdmin && (
                      <button
                          onClick={() => {
                              console.log('¡Botón de Administrador Clickeado!');
                              navigate('/admin');
                          }}
                          className="btn-admin"
                      >
                          Administrador
                      </button>
                  )}
                  <button onClick={() => navigate('/profile')} className="btn-profile">
                      Perfil
                  </button>
                  <button
                      onClick={handleLogout}
                      className="btn-logout"
                      style={{backgroundColor: 'red', color: 'white'}}
                  >
                      Cerrar Sesión
                  </button>
              </div>
          ) : (
              <div>
                  <button
                      onClick={() => navigate('/register')}
                      className="btn-primary"
                      style={{ width: 'auto', padding: '8px 15px' }}
                  >
                      Crear Cuenta
                  </button>
                  <button onClick={() => navigate('/login')} style={{ marginLeft: '10px' }}>
                      Iniciar Sesión
                  </button>
              </div>
          )}
      </header>


      <main>
        {/* --- Sección Hero con la imagen de fondo correcta y el logo correcto --- */}
        <section className="hero-section" style={{ backgroundImage: `url(${heroBackground})` }}>
          <div className="logo-circulo" style={{background: 'white', borderRadius: '50%', padding: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
             <h1 className="logo" style={{fontSize: '3rem', color: 'black'}}>llega</h1>
          </div>
          <h2>Llega al espacio que quieras</h2>
          <div className="search-bar">
            <input type="text" placeholder="¿Qué espacio buscas?" />
            <button className="btn-primary" style={{width: 'auto'}}>Filtrar Búsqueda</button>
          </div>
        </section>

        {/* --- RESTAURANDO SECCIONES FALTANTES --- */}
        <section className="spaces-section">
          <h3>Nuestros tipos de espacios:</h3>
          <div className="spaces-grid">
            <SpaceTypeCard 
              title="Educativos y Laboratorios" 
              description="Espacios para la practica educativa, investigación y desarrollo." 
              imageUrl={educativosImage}
              onClick={() => handleViewSpacesClick('educativos')} 
            />
            <SpaceTypeCard 
              title="Deportivos" 
              description="Terrenos y canchas para desempeñar distintas diciplinas deportivas." 
              imageUrl={deportivosImage}
              onClick={() => handleViewSpacesClick('deportivos')} 
            />
             <SpaceTypeCard 
              title="Auditorios" 
              description="Lugares indicados para realizar conferencias, presentaciones o eventos." 
              imageUrl={auditoriosImage}
              onClick={() => handleViewSpacesClick('auditorios')} 
            />
             <SpaceTypeCard 
              title="Oficinas" 
              description="Espacios privados y tranquilos, perfectos para trabajar o estudiar." 
              imageUrl={oficinasImage}
              onClick={() => handleViewSpacesClick('oficinas')} 
            />
          </div>
        </section>

        <section className="spaces-section">
          <h3>Espacios más solicitados</h3>
          <div className="spaces-grid">
              <div className="space-requested-card">
                  <img src={centroMundoXImage} alt="Centro Mundo X" />
                  <h4>Centro Mundo X</h4>
              </div>
          </div>
        </section>
      </main>

      {/* --- RESTAURANDO EL FOOTER --- */}
      <footer className="home-footer">
        <div style={{marginBottom: '20px'}}>
            <img src={logoUnimet} alt="Logo Universidad Metropolitana" style={{width: '200px'}} />
        </div>
        <p>© 2025 Universidad Metropolitana. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default Home;