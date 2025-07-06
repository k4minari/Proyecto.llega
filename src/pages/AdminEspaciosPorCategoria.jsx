import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebase/config';
import useAuth from '../hooks/useAuth';

import logoUnimet from '../assets/Logo-UNIMET-color-300-dpi.jpg';

const categories = [
    { label: 'Deportivo', value: 'deportivo' },
    { label: 'Educativo', value: 'educativo' },
    { label: 'Tecnología', value: 'tecnologia' },
    { label: 'Exposiciones', value: 'exposiciones' },
];

const AdminEspaciosPorCategoria = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, loading } = useAuth();

    const params = new URLSearchParams(location.search);
    const initialCategory = params.get('categoria') || '';

    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [spaces, setSpaces] = useState([]);
    const [loadingSpaces, setLoadingSpaces] = useState(false);

    useEffect(() => {
        setSelectedCategory(initialCategory);
    }, [initialCategory]);

    useEffect(() => {
        if (loading) return;
        if (!currentUser || currentUser.role !== 'admin') {
            navigate('/');
        }
    }, [currentUser, loading, navigate]);

    useEffect(() => {
        if (!selectedCategory) {
            setSpaces([]);
            return;
        }
        setLoadingSpaces(true);
        const fetchSpaces = async () => {
            const q = query(collection(db, 'spaces'), where('type', '==', selectedCategory));
            const snapshot = await getDocs(q);
            setSpaces(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoadingSpaces(false);
        };
        fetchSpaces();
    }, [selectedCategory]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            alert("Hubo un problema al cerrar tu sesión.");
        }
    };

    return (
        <div className="home-container">
            <header className="home-header">
                <h1 className="logo" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>llega</h1>
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
                            style={{backgroundColor: 'red', color: 'white'}}
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                ) : (
                    <div>
                        <button onClick={() => navigate('/register')} className="btn-primary"
                                style={{width: 'auto', padding: '8px 15px'}}>Crear Cuenta
                        </button>
                        <button onClick={() => navigate('/login')} style={{marginLeft: '10px'}}>Iniciar Sesión</button>
                    </div>
                )}
            </header>


            <main>
                <section className="spaces-section">
                    <h2 style={{marginBottom: '32px', marginTop: '16px'}}>Editar Espacios por Categoría</h2>
                    <div style={{display: 'flex', gap: '32px', marginBottom: '48px'}}>
                        <div style={{display: 'flex', flexDirection: 'column'}}>
                            <label style={{marginBottom: '6px', fontWeight: 'bold', display: 'block'}}>Categoría</label>
                            <select
                                value={selectedCategory}
                                onChange={e => setSelectedCategory(e.target.value)}
                                style={{
                                    width: '250px',
                                    borderRadius: '8px',
                                    border: '2px solid #333',
                                    padding: '8px 12px',
                                    color: '#333',
                                    background: '#fff',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    display: 'block'
                                }}
                            >
                                <option value="">Selecciona una categoría</option>
                                {categories.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="spaces-grid">
                        {loadingSpaces ? (
                            <p>Cargando espacios...</p>
                        ) : (
                            spaces.length > 0 ? (
                                spaces.map(space => (
                                    <div key={space.id} className="space-card">
                                        <img src={space.imageUrl} alt={space.name} className="space-card-img" />
                                        <div className="space-card-body">
                                            <h4>{space.name}</h4>
                                            <p>{space.description}</p>
                                            <button
                                                onClick={() => navigate(`/admin/editar-espacio/${space.id}`)}
                                                className="btn-primary"
                                                style={{ marginTop: '12px' }}
                                            >
                                                Editar espacio
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>No hay espacios para esta categoría.</p>
                            )
                        )}
                    </div>
                </section>
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

export default AdminEspaciosPorCategoria;