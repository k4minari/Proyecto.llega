// src/pages/Reservation.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import useAuth from '../hooks/useAuth';

const Reservation = () => {
    const { spaceId } = useParams();
    const [space, setSpace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSpace = async () => {
            if (!spaceId) {
                setError("No se proporcionó un ID de espacio.");
                setLoading(false);
                return;
            }
            try {
                // Esta es la única consulta a la base de datos que necesitamos ahora
                const docRef = doc(db, 'spaces', spaceId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setSpace({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setError("El documento del espacio no fue encontrado.");
                }
            } catch (err) {
                console.error("Error al obtener el documento:", err);
                setError("Ocurrió un error técnico al buscar el espacio.");
            } finally {
                setLoading(false);
            }
        };

        fetchSpace();
    }, [spaceId]);

    // --- Hemos ELIMINADO por completo el segundo useEffect que buscaba al supervisor ---

    const handleReservation = async () => {
        // ... (La lógica de esta función no cambia)
        if (!currentUser) {
            navigate('/login');
            return;
        }
        try {
            const reservationData = {
                userId: currentUser.uid,
                spaceId: space.id,
                spaceName: space.name,
                status: 'pending',
                createdAt: serverTimestamp(),
                price: space.price,
            };
            const docRef = await addDoc(collection(db, "reservations"), reservationData);
            navigate(`/pago/${docRef.id}`);
        } catch (error) {
            console.error("Error al crear la reserva: ", error);
            alert("Hubo un problema al intentar crear tu reserva.");
        }
    };

    if (loading) return <div className="page-container"><h2>Cargando...</h2></div>;
    if (error || !space) {
        return (
            <div className="page-container" style={{ textAlign: 'center' }}>
                <h1>Espacio no encontrado</h1>
                <p>{error || "El espacio que buscas no existe o fue eliminado."}</p>
                <Link to="/">Volver al inicio</Link>
            </div>
        );
    }

    // --- El JSX actualizado que muestra la información directamente ---
    return (
        <div className="page-container" style={{maxWidth: '500px', margin: '40px auto', textAlign: 'center'}}>
            <h1 className="page-title">Página de Reserva</h1>
            <div className="reservation-card-detail" style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}}>
                <img src={space.imageUrl} alt={space.name} style={{width: '100%', borderRadius: '8px', marginBottom: '20px'}} />
                <h2>{space.name}</h2>
                <p>{space.description}</p>
                <hr style={{margin: '15px 0'}} />
                <p><strong>Precio por hora: ${space.price}</strong></p>
                
                {/* ▼▼▼ ¡AQUÍ ESTÁ EL CAMBIO CLAVE! ▼▼▼ */}
                {/* Mostramos el supervisor si el campo supervisorId existe y tiene contenido */}
                {space.supervisorId ? (
                    <p>Supervisor de espacio: <strong>{space.supervisorId}</strong></p>
                ) : (
                    <p>Supervisor de espacio: No asignado</p>
                )}
                {/* ▲▲▲ ¡FIN DEL CAMBIO CLAVE! ▲▲▲ */}
                
                <button onClick={handleReservation} className="btn-primary" style={{width: '100%', marginTop: '20px'}}>
                    Reservar Ya
                </button>
            </div>
        </div>
    );
};

export default Reservation;