import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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

const inputStyle = {
    width: '250px',
    borderRadius: '8px',
    border: '2px solid #333',
    padding: '8px 12px',
    color: '#fff',
    background: '#333',
    backgroundColor: '#333',
    fontSize: '1rem',
    outline: 'none',
    display: 'block'
};

const labelStyle = {
    marginBottom: '6px',
    fontWeight: 'bold',
    display: 'block'
};

function parseTime(timeStr) {
    const [hour, minute] = timeStr.split(':').map(Number);
    return { hour, minute };
}

function isTimeOverlap(startA, endA, startB, endB) {
    return startA < endB && startB < endA;
}

function getNextAvailableTime(reservedHours, selectedHour) {
    let next = selectedHour + 1;
    while (next <= 17) {
        if (!reservedHours.includes(next)) return next;
        next++;
    }
    return null;
}

const EspaciosPorCategoria = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const initialCategory = searchParams.get('categoria') || '';
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [spaces, setSpaces] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!selectedCategory) {
            setSpaces([]);
            return;
        }
        setLoading(true);
        const fetchSpaces = async () => {
            const q = query(collection(db, 'spaces'), where('type', '==', selectedCategory));
            const snapshot = await getDocs(q);
            setSpaces(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
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

    const handleViewSpace = async (spaceId) => {
        if (!date) {
            alert("Por favor selecciona una fecha.");
            return;
        }
        if (!time) {
            alert("Por favor selecciona una hora.");
            return;
        }

        const now = new Date();
        const selectedDate = new Date(date + 'T' + time);

        if (selectedDate < now.setSeconds(0,0)) {
            alert("La fecha y hora seleccionadas no pueden ser en el pasado.");
            return;
        }

        const { hour: selectedHour, minute } = parseTime(time);
        if (selectedHour < 8 || selectedHour >= 17 || (selectedHour === 17 && minute > 0)) {
            alert("La hora debe estar entre 08:00 y 17:00.");
            return;
        }

        if (!currentUser) {
            alert("Para ver los detalles y reservar, primero necesitas iniciar sesión.");
            navigate('/login');
            return;
        }

        try {
            const qSpace = query(
                collection(db, 'reservations'),
                where('spaceId', '==', spaceId),
                where('fecha', '==', date)
            );
            const snapSpace = await getDocs(qSpace);
            const reservedHours = snapSpace.docs.map(doc => parseTime(doc.data().hora).hour);

            if (reservedHours.includes(selectedHour)) {
                const sorted = reservedHours.sort((a, b) => a - b);
                const next = getNextAvailableTime(sorted, selectedHour);
                if (next) {
                    alert(`El espacio no está disponible a esa hora. El siguiente horario disponible es a las ${next}:00.`);
                } else {
                    alert('El espacio no está disponible en ningún horario posterior hoy.');
                }
                return;
            }

            const qUser = query(
                collection(db, 'reservations'),
                where('userId', '==', currentUser.uid),
                where('fecha', '==', date)
            );
            const snapUser = await getDocs(qUser);
            const userHours = snapUser.docs.map(doc => parseTime(doc.data().hora).hour);

            if (userHours.some(h => isTimeOverlap(h, h + 1, selectedHour, selectedHour + 1))) {
                alert('Ya tienes una reservación en ese horario.');
                return;
            }

            navigate(`/reserva/${spaceId}?fecha=${date}&hora=${time}`);
        }catch (error) {
            console.error('Error verificando disponibilidad:', error);
            alert('Error verificando disponibilidad.');
        }
    };

    return (
        <div className="home-container">
            <header className="home-header">
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
                        <button onClick={() => navigate('/register')} className="btn-primary" style={{ width: 'auto', padding: '8px 15px' }}>Crear Cuenta</button>
                        <button onClick={() => navigate('/login')} style={{ marginLeft: '10px' }}>Iniciar Sesión</button>
                    </div>
                )}
            </header>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px' }}>
                <h2 style={{ marginBottom: '32px', marginTop: '16px' }}>Espacios por Categoría</h2>
                <div style={{ display: 'flex', gap: '32px', marginBottom: '48px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={labelStyle}>Categoría</label>
                        <select
                            value={selectedCategory}
                            onChange={e => setSelectedCategory(e.target.value)}
                            style={inputStyle}
                        >
                            <option value="">Selecciona una categoría</option>
                            {categories.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={labelStyle}>Fecha</label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            style={inputStyle}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={labelStyle}>Hora</label>
                        <input
                            type="time"
                            value={time}
                            onChange={e => setTime(e.target.value)}
                            style={inputStyle}
                        />
                    </div>
                </div>
                <div className="spaces-grid">
                    {loading ? (
                        <p>Cargando espacios...</p>
                    ) : (
                        spaces.length > 0 ? (
                            spaces.map(space => (
                                <div key={space.id} className="space-card">
                                    <img src={space.imageUrl} alt={space.name} className="space-card-img" />
                                    <div className="space-card-body">
                                        <h4>{space.name}</h4>
                                        <p>{space.description}</p>
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                                            <button
                                                onClick={() => handleViewSpace(space.id)}
                                                className="btn-primary"
                                            >
                                                Ver espacio
                                            </button>
                                            <Link to={`/espacio/${space.id}/calendario`}>
                                                <button className="btn-primary">
                                                    Revisar Calendario
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No hay espacios para esta categoría.</p>
                        )
                    )}
                </div>
            </div>

            <footer className="home-footer">
                <div style={{ marginBottom: '20px' }}>
                    <img src={logoUnimet} alt="Logo Unimet" style={{ width: '200px' }} />
                </div>
                <p>© 2025 Universidad Metropolitana. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
};

export default EspaciosPorCategoria;