// src/pages/Reservation.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db, auth } from '../firebase/config';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const Reservation = () => {
  const { spaceId } = useParams(); // Obtiene el ID del espacio desde la URL
  const navigate = useNavigate();
  const [spaceData, setSpaceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false); // Estado para el botón de reservar

  useEffect(() => {
    const fetchSpaceData = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'espacios', spaceId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setSpaceData(docSnap.data());
        } else {
          console.log("No se encontró el documento del espacio!");
          setSpaceData(null); // Marcar que no se encontró
        }
      } catch (error) {
        console.error("Error al obtener datos del espacio:", error);
      }
      setLoading(false);
    };

    if (spaceId) {
      fetchSpaceData();
    }
  }, [spaceId]);

  const handleReserveClick = async () => {
    setReserving(true);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert("Debes iniciar sesión para poder reservar.");
      navigate('/login');
      setReserving(false);
      return;
    }

    try {
      // Creamos un nuevo documento en la colección "reservas"
      await addDoc(collection(db, "reservas"), {
        userId: currentUser.uid,
        spaceId: spaceId,
        spaceName: spaceData.nombre,
        reservationDate: serverTimestamp(),
        status: "confirmada"
      });

      alert(`¡Reserva para ${spaceData.nombre} realizada con éxito!`);
      navigate('/'); // Volvemos al home después de reservar
      
    } catch (error) {
      console.error("Error al guardar la reserva: ", error);
      alert("Hubo un problema al procesar tu reserva. Por favor, inténtalo de nuevo.");
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return <div>Cargando información del espacio...</div>;
  }

  if (!spaceData) {
    return (
      <div className="page-container">
        <h1>Espacio no encontrado</h1>
        <p>El espacio que buscas no existe o fue eliminado.</p>
        <Link to="/">Volver al inicio</Link>
      </div>
    );
  }

  return (
    <div className="page-container" style={{maxWidth: '1200px'}}>
      <header className="home-header">
        {/* ... Header sin cambios ... */}
      </header>

      <h2 className="page-title" style={{marginTop: '40px'}}>Página de Reserva</h2>
      
      <div className="reservation-content">
        <div className="reservation-image-container">
          <img src={spaceData.imageUrl || 'https://via.placeholder.com/600x400'} alt={spaceData.nombre} />
        </div>
        <div className="reservation-details-container">
          <h1>{spaceData.nombre}</h1>
          <p className="space-type">{spaceData.tipo}</p>
          <p className="space-price">{spaceData.precio}</p>
          <p className="space-description">{spaceData.descripcion}</p>
          
          <button 
            onClick={handleReserveClick} 
            className="btn-primary" 
            disabled={reserving}
            style={{width: '100%', marginTop: '20px', padding: '15px'}}
          >
            {reserving ? 'Procesando Reserva...' : 'RESERVAR YA'}
          </button>

          <div className="supervisor-info">
            <h4>Supervisor de espacio:</h4>
            <p>{spaceData.supervisor}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reservation;