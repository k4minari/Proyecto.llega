// src/pages/MyReservations.jsx

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import useAuth from '../hooks/useAuth';

const MyReservations = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    useEffect(() => {
        // Solo intentamos buscar reservas si tenemos un usuario
        if (currentUser) {
            const fetchReservations = async () => {
                // Creamos una consulta a Firestore para obtener las reservas del usuario actual, ordenadas por fecha
                const q = query(
                    collection(db, "reservations"), 
                    where("userId", "==", currentUser.uid), 
                    orderBy("createdAt", "desc")
                );
                
                const querySnapshot = await getDocs(q);
                const userReservations = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setReservations(userReservations);
                setLoading(false);
            };

            fetchReservations();
        }
    }, [currentUser]); // Este efecto se ejecutará cada vez que cambie el usuario

    if (loading) {
        return <div className="page-container"><h2>Cargando tus reservas...</h2></div>;
    }

    return (
        <div className="page-container">
            <h2>Mis Reservas</h2>
            {reservations.length === 0 ? (
                <p>Aún no tienes ninguna reserva activa o pasada.</p>
            ) : (
                reservations.map(res => (
                    <div key={res.id} className="reservation-card">
                        <h4>{res.spaceName}</h4>
                        <p>Fecha de la reserva: {new Date(res.createdAt?.toDate()).toLocaleDateString()}</p>
                        <p>Precio pagado: ${res.price}</p>
                        <p>Estado: <span className={`status-${res.status}`}>{res.status}</span></p>
                    </div>
                ))
            )}
        </div>
    );
};

export default MyReservations;