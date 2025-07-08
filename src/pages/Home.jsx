import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import useAuth from '../hooks/useAuth';

import heroBackground from '../assets/UNIMET.jpg';
import logoUnimet from '../assets/Logo-UNIMET-color-300-dpi.jpg';

const categories = [
    { label: 'Deportivo', value: 'deportivo', imageUrl: 'https://static.wixstatic.com/media/709bfd_416a82333aea4bbdbe02930a0cbceb5b~mv2.webp/v1/fill/w_980,h_735,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/ciudad%20del%20deporte.webp' },
    { label: 'Educativo', value: 'educativo', imageUrl: 'https://media.licdn.com/dms/image/v2/D4E22AQF9aFMThdhYFQ/feedshare-shrink_800/B4EZedbSjnHIAw-/0/1750692867160?e=2147483647&v=beta&t=C9ppJUdkOS3Nsj989BwNthEWr7ngcQoPjIlnxLdnGt4' },
    { label: 'Tecnología', value: 'tecnologia', imageUrl: 'https://www.unimet.edu.ve/wp-content/uploads/2024/04/Centro-Mundo-X.jpg' },
    { label: 'Exposiciones', value: 'exposiciones', imageUrl: 'https://www.unimet.edu.ve/wp-content/uploads/2025/06/FOTOS-DE-CERTIFICADOS-DE-AUDITORIA-1-1024x683.jpg' },
];

const CategoryCard = ({ category, onClick }) => (
    <div className="space-card" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
        <img src={category.imageUrl} alt={category.label} className="space-card-img" />
        <div className="space-card-body">
            <h4>{category.label}</h4>
            <button
                onClick={() => onClick(category.value)}
                className="btn-primary"
            >
                Ir a espacios de {category.label}
            </button>
        </div>
    </div>
);

const SpaceCard = ({ space, onClick }) => (
    <div className="space-card" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
        <img src={space.imageUrl} alt={space.name} className="space-card-img" />
        <div className="space-card-body">
            <h4>{space.name}</h4>
            <p style={{ margin: '8px 0 0 0', color: '#888', fontSize: 15 }}>
                Reservas: {space.reservationCount}
            </p>
            <button
                onClick={() => onClick(space.id)}
                className="btn-primary"
                style={{ marginTop: 12 }}
            >
                Editar Espacio
            </button>
        </div>
    </div>
);

const Home = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [topSpaces, setTopSpaces] = useState([]);
    const [loadingTop, setLoadingTop] = useState(false);

    useEffect(() => {
        const fetchTopSpaces = async () => {
            if (!currentUser || currentUser.role !== 'admin') return;
            setLoadingTop(true);

            const spacesSnap = await getDocs(collection(db, 'spaces'));
            const spaces = spacesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const reservationsSnap = await getDocs(collection(db, 'reservations'));
            const reservationCounts = {};
            reservationsSnap.docs.forEach(doc => {
                const data = doc.data();
                if (data.spaceId) {
                    reservationCounts[data.spaceId] = (reservationCounts[data.spaceId] || 0) + 1;
                }
            });

            const spacesWithCount = spaces.map(space => ({
                ...space,
                reservationCount: reservationCounts[space.id] || 0
            }));

            const top = spacesWithCount
                .sort((a, b) => b.reservationCount - a.reservationCount)
                .slice(0, 4);

            setTopSpaces(top);
            setLoadingTop(false);
        };
        fetchTopSpaces();
    }, [currentUser]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            alert("Hubo un problema al cerrar tu sesión.");
        }
    };

    const handleCategoryClick = (categoryValue) => {
        if (currentUser && currentUser.role === 'admin') {
            navigate(`/admin/espacios?categoria=${categoryValue}`);
        } else {
            navigate(`/espacios?categoria=${categoryValue}`);
        }
    };

    const handleEditSpace = (spaceId) => {
        navigate(`/admin/editar-espacio/${spaceId}`);
    };

    return (
        <div className="home-container">
            <header className="home-header">
                <h1 className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>llega</h1>
                <nav>
                    <Link to="/">Inicio</Link>
                    {currentUser && currentUser.role !== 'admin' && (
                        <Link to="/mis-reservas">Mis Reservas</Link>
                    )}
                    {currentUser && currentUser.role === 'admin' && (
                        <Link to="/admin/espacios/crear">Crear Espacio</Link>
                    )}
                </nav>
                {currentUser ? (
                    <div className="user-actions">
                        <button onClick={() => navigate('/profile')} className="btn-profile">Perfil</button>
                        <button
                            onClick={handleLogout}
                            className="btn-logout"
                            style={{ backgroundColor: 'red', color: 'white' }}
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                ) : (
                    <div>
                        <button onClick={() => navigate('/register')} className="btn-primary" style={{ width: 'auto', padding: '8px 15px' }}>Crear Cuenta</button>
                        <button onClick={() => navigate('/login')} style={{ marginLeft: '10px' }}>Iniciar Sesión</button>
                    </div>
                )}
            </header>

            <main>
                <section className="hero-section" style={{backgroundImage: `url(${heroBackground})`}}>
                    <div
                        className="logo-circulo"
                        style={{
                            background: 'white',
                            borderRadius: '50%',
                            width: '160px',
                            height: '160px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: '20px',
                            marginLeft: 'auto',
                            marginRight: 'auto'
                        }}
                    >
                        <h1 className="logo" style={{fontSize: '3rem', color: 'black', margin: 0}}>llega</h1>
                    </div>
                    <h2>Llega al espacio que quieras</h2>
                </section>

                <section className="spaces-section">
                    <h3>Categorías</h3>
                    <div className="spaces-grid">
                        {categories.map(cat => (
                            <CategoryCard key={cat.value} category={cat} onClick={handleCategoryClick}/>
                        ))}
                    </div>
                </section>

                {currentUser && currentUser.role === 'admin' && (
                    <section className="spaces-section" style={{ marginTop: 10 }}>
                        <h3>Espacios más solicitados</h3>
                        {loadingTop ? (
                            <p>Cargando...</p>
                        ) : (
                            <div className="spaces-grid">
                                {topSpaces.map(space => (
                                    <SpaceCard key={space.id} space={space} onClick={handleEditSpace} />
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </main>

            <footer className="home-footer">
                <div style={{ marginBottom: '20px' }}>
                    <img src={logoUnimet} alt="Logo Unimet" style={{ width: '200px' }} />
                </div>
                <p>© 2025 Universidad Metropolitana. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
};

export default Home;