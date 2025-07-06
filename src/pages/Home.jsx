// src/pages/Home.jsx

// --- 1. Imports ---
import React, { useState, useEffect } from 'react'; // <-- Añadimos useState y useEffect
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore'; // <-- Imports de Firestore
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase/config';      // <-- Importamos db
import useAuth from '../hooks/useAuth';

// --- (Opcional) Puedes mantener tus imports de imágenes si las usas en el hero o footer ---
import heroBackground from '../assets/UNIMET.jpg';
import logoUnimet from '../assets/Logo-UNIMET-color-300-dpi.jpg';


// --- 2. Componente Reutilizable para las Tarjetas ---
// Lo renombramos a SpaceCard para más claridad, ya que ahora muestra un espacio individual
const SpaceCard = ({ id, title, description, imageUrl, onClick }) => (
  <div className="space-card" style={{minHeight: '400px', display: 'flex', flexDirection: 'column'}}>
    <img src={imageUrl} alt={title} className="space-card-img" />
    <div className="space-card-body">
      <h4>{title}</h4>
      <p>{description}</p>
      {/* El botón ahora usa el ID del espacio para navegar */}
      <button onClick={() => onClick(id)} className="btn-secondary" style={{backgroundColor: '#007bff', color: 'white', marginTop: 'auto'}}>Ir a espacios</button>
    </div>
  </div>
);


// --- 3. Componente Principal Home ---
const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Este hook ahora contiene el rol del usuario

  // --- Estados para manejar los datos y la búsqueda ---
  const [spaces, setSpaces] = useState([]); // Guardará la lista de espacios de Firestore
  const [loading, setLoading] = useState(true); // Para mostrar un mensaje de carga
  const [searchTerm, setSearchTerm] = useState(''); // Para el valor del input de búsqueda

  // --- Cargar los datos de Firestore cuando la página se monta ---
  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const spacesCollection = collection(db, 'spaces');
        const spacesSnapshot = await getDocs(spacesCollection);
        const spacesList = spacesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSpaces(spacesList);
      } catch (error) {
        console.error("Error al cargar los espacios: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpaces();
  }, []); // El array vacío [] asegura que esto se ejecute solo una vez

  // --- Funciones de Lógica ---
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("Hubo un problema al cerrar tu sesión.");
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
        // Si no hay texto, podríamos recargar todos los espacios. Por ahora no hacemos nada.
        return;
    }
    setLoading(true);
    // Busca en Firestore donde el campo 'type' sea igual al término de búsqueda (es sensible a mayúsculas)
    const q = query(collection(db, "spaces"), where("type", "==", searchTerm));
    const querySnapshot = await getDocs(q);
    const searchedSpaces = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setSpaces(searchedSpaces);
    setLoading(false);
  };

  const handleViewSpaceClick = (spaceId) => {
    if (currentUser) {
      navigate(`/reserva/${spaceId}`);
    } else {
      alert("Para ver los detalles y reservar, primero necesitas iniciar sesión.");
      navigate('/login');
    }
  };


  // --- Renderizado del Componente ---
  return (
    <div className="home-container">
      {/* --- Encabezado --- */}
      <header className="home-header">
        <h1 className="logo" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>llega</h1>
        <nav>
          <Link to="/">Inicio</Link>
          <Link to="/categories">Categorías</Link>
          {currentUser && <Link to="/mis-reservas">Mis Reservas</Link>}
        </nav>
        
        {/* Lógica de botones de usuario */}
        {currentUser ? (
          <div className="user-actions">
            {/* La comprobación del rol ahora viene directamente de currentUser */}
            {currentUser.role === 'admin' && (
              <button onClick={() => navigate('/admin')} className="btn-admin">
                Administrador
              </button>
            )}
            <button onClick={() => navigate('/profile')} className="btn-profile">Perfil</button>
            <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
          </div>
        ) : (
          <div>
            <button onClick={() => navigate('/register')} className="btn-primary" style={{width: 'auto', padding: '8px 15px'}}>Crear Cuenta</button>
            <button onClick={() => navigate('/login')} style={{marginLeft: '10px'}}>Iniciar Sesión</button>
          </div>
        )}
      </header>

      {/* --- Sección Hero --- */}
      <main>
        <section className="hero-section" style={{backgroundImage: `url(${heroBackground})`}}>
            <div className="logo-circulo" style={{background: 'white', borderRadius: '50%', padding: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <h1 className="logo" style={{fontSize: '3rem', color: 'black'}}>llega</h1>
            </div>
          <h2>Llega al espacio que quieras</h2>
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Busca por tipo (ej: Educativo)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={handleSearch} className="btn-primary" style={{width: 'auto'}}>Filtrar Búsqueda</button>
          </div>
        </section>

        {/* --- Sección de Espacios Dinámica --- */}
        <section className="spaces-section">
          <h3>Nuestros tipos de espacios:</h3>
          {loading ? (
            <p>Cargando espacios...</p>
          ) : (
            <div className="spaces-grid">
              {spaces.length > 0 ? (
                spaces.map(space => (
                  <SpaceCard 
                    key={space.id}
                    id={space.id}
                    title={space.name} 
                    description={space.description}
                    imageUrl={space.imageUrl} // <-- Asegúrate de tener este campo en Firestore
                    onClick={handleViewSpaceClick}
                  />
                ))
              ) : (
                <p>No se encontraron espacios con ese criterio.</p>
              )}
            </div>
          )}
        </section>
        
        {/* Puedes mantener o hacer dinámica también la sección de más solicitados */}
        <section className="spaces-section">
          <h3>Espacios más solicitados</h3>
          {/* ... */}
        </section>
      </main>

      {/* --- Footer --- */}
      <footer className="home-footer">
        <div style={{marginBottom: '20px'}}>
            <img src={logoUnimet} alt="Logo Unimet" style={{width: '200px'}} />
        </div>
        <p>© 2025 Universidad Metropolitana. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default Home;