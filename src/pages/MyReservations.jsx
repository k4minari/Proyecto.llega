import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import useAuth from '../hooks/useAuth';
import logoUnimet from '../assets/Logo-UNIMET-color-300-dpi.jpg';

function getReservationEndDate(fecha, hora) {
    if (!fecha || !hora) return null;
    const [year, month, day] = fecha.split('-').map(Number);
    const [hour, minute] = hora.split(':').map(Number);
    const date = new Date(year, month - 1, day, hour, minute);
    date.setHours(date.getHours() + 1);
    return date;
}

const cardStyle = {
    width: 320,
    minHeight: 180,
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    padding: 20,
    margin: 12,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxSizing: 'border-box'
};

const MyReservations = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        const fetchReservations = async () => {
            try {
                const q = query(
                    collection(db, "reservations"),
                    where("userId", "==", currentUser.uid)
                );
                const querySnapshot = await getDocs(q);
                const userReservations = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                const reservationsWithSpace = await Promise.all(
                    userReservations.map(async (res) => {
                        if (!res.spaceId) return { ...res };
                        const spaceRef = doc(db, "spaces", res.spaceId);
                        const spaceSnap = await getDoc(spaceRef);
                        const spaceData = spaceSnap.exists() ? spaceSnap.data() : {};
                        return {
                            ...res,
                            spaceCategory: spaceData.type || '',
                            spaceImage: spaceData.imageUrl || '/placeholder.jpg',
                        };
                    })
                );
                setReservations(reservationsWithSpace);
            } catch {
                setError("Error loading reservations.");
            } finally {
                setLoading(false);
            }
        };

        fetchReservations();
    }, [currentUser]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch {
            alert("Hubo un problema al cerrar tu sesión.");
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteDoc(doc(db, "reservations", id));
            setReservations(prev => prev.filter(res => res.id !== id));
        } catch (err) {
            console.error("Error deleting reservation:", err);
            alert("No se pudo eliminar la reserva.");
        }
    };

    const handleShowQR = (id) => {
        navigate(`/qr/${id}`);
    };

    const now = new Date();
    const current = [];
    const past = [];
    reservations.forEach(res => {
        const endDate = getReservationEndDate(res.fecha, res.hora);
        if (endDate && endDate < now) {
            past.push(res);
        } else {
            current.push(res);
        }
    });

    const renderReservationCard = (res, showQR = true, showDelete = false, showFeedback = false) => (
        <div key={res.id} style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <img
                    src={res.spaceImage || '/placeholder.jpg'}
                    alt={res.spaceName}
                    style={{
                        width: 70,
                        height: 70,
                        objectFit: 'cover',
                        borderRadius: 8,
                        marginRight: 16
                    }}
                />
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>
                        {res.spaceName}
                    </div>
                    <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>
                        {res.spaceCategory === 'tecnologia'
                            ? 'Espacio Tecnológico'
                            : res.spaceCategory === 'exposiciones'
                                ? 'Espacio de Exposiciones'
                                : `Espacio ${res.spaceCategory || 'desconocido'}`}
                    </div>
                    <div style={{ fontSize: 15, color: '#333', marginBottom: 8 }}>
                        {res.fecha ? res.fecha : 'No especificada'}
                        {res.hora ? ` a las ${res.hora}` : ''}
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 16 }}>
        <span style={{ fontSize: 15, color: '#333' }}>
          Precio: ${res.price}
        </span>
                {showQR && (
                    <button
                        style={{
                            marginLeft: 16,
                            background: '#1976d2',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '8px 16px',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                        onClick={() => handleShowQR(res.id)}
                    >
                        Ver QR
                    </button>
                )}
                {showDelete && (
                    <button
                        onClick={() => handleDelete(res.id)}
                        style={{
                            marginLeft: 16,
                            background: '#e53935',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '8px 16px',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        Eliminar
                    </button>
                )}
                {showFeedback && (
                    <button
                        onClick={() => navigate(`/feedback/${res.id}`)}
                        style={{
                            marginLeft: 16,
                            background: '#ff7300',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '8px 16px',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        Dejar Feedback
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div
            className="home-container"
            style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
            }}
        >
            <header className="home-header" style={{ flexShrink: 0 }}>
                <h1 className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>llega</h1>
                <nav>
                    <Link to="/">Inicio</Link>
                    {currentUser && <Link to="/mis-reservas">Mis Reservas</Link>}
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
                        <button onClick={() => navigate('/register')} className="btn-primary"
                                style={{ width: 'auto', padding: '8px 15px' }}>Crear Cuenta
                        </button>
                        <button onClick={() => navigate('/login')} style={{ marginLeft: '10px' }}>Iniciar Sesión</button>
                    </div>
                )}
            </header>

            <main
                style={{
                    flexGrow: 1,
                    padding: '32px',
                }}
            >
                <div className="page-container">
                    <h2 style={{ textAlign: 'center', marginBottom: '32px' }}>Mis Reservas</h2>
                    {loading ? (
                        <h2 style={{ textAlign: 'center' }}>Cargando tus reservas...</h2>
                    ) : error ? (
                        <h2 style={{ textAlign: 'center' }}>{error}</h2>
                    ) : !currentUser ? (
                        <h2 style={{ textAlign: 'center' }}>Debes iniciar sesión para ver tus reservas.</h2>
                    ) : current.length === 0 ? (
                        <p style={{ textAlign: 'center' }}>Aún no tienes ninguna reserva activa.</p>
                    ) : (
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                justifyContent: 'center',
                                alignItems: 'flex-start',
                            }}
                        >
                            {current.map(res => renderReservationCard(res, true, false, false))}
                        </div>
                    )}

                    <h2 style={{ textAlign: 'center', margin: '48px 0 32px 0' }}>Reservas Anteriores</h2>
                    {past.length === 0 ? (
                        <p style={{ textAlign: 'center' }}>No tienes reservas anteriores.</p>
                    ) : (
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                justifyContent: 'center',
                                alignItems: 'flex-start',
                            }}
                        >
                            {past.map(res => renderReservationCard(res, false, true, true))}
                        </div>
                    )}
                </div>
            </main>

            <footer className="home-footer" style={{ flexShrink: 0, padding: '20px', textAlign: 'center' }}>
                <div style={{ marginBottom: '20px' }}>
                    <img src={logoUnimet} alt="Logo Unimet" style={{ width: '200px' }} />
                </div>
                <p>© 2025 Universidad Metropolitana. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
};

export default MyReservations;
