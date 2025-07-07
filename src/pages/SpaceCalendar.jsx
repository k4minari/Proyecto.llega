import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const SpaceCalendar = () => {
    const { spaceId } = useParams();
    const navigate = useNavigate();
    const [space, setSpace] = useState(null);
    const [reservations, setReservations] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSpace = async () => {
            try {
                const docRef = doc(db, 'spaces', spaceId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setSpace({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setSpace(null);
                }
            } catch (error) {
                console.error('Error fetching space:', error);
                setSpace(null);
            } finally {
                setLoading(false);
            }
        };
        fetchSpace();
    }, [spaceId]);

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                console.log('Fetching all reservations for spaceId:', spaceId);

                const q = query(
                    collection(db, 'reservations'),
                    where('spaceId', '==', spaceId)
                );

                const snap = await getDocs(q);
                console.log('Número de reservas encontradas:', snap.size);

                const reservationsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.log('Reservas:', reservationsData);

                setReservations(reservationsData);
            } catch (error) {
                console.error('Error fetching reservations:', error);
                setReservations([]);
            }
        };
        fetchReservations();
    }, [spaceId]);

    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const dateStr = formatDate(date);
            if (reservations.some(r => r.fecha === dateStr)) {
                return 'reserved-date';
            }
        }
        return null;
    };

    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const dateStr = formatDate(date);
            const dayReservations = reservations
                .filter(r => r.fecha === dateStr)
                .sort((a, b) => a.hora.localeCompare(b.hora));
            if (dayReservations.length > 0) {
                const maxToShow = 3;
                const hoursToShow = dayReservations.slice(0, maxToShow).map(r => r.hora);
                const moreCount = dayReservations.length - maxToShow;

                return (
                    <div style={{ marginTop: 2, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
                        {hoursToShow.map((hora, i) => (
                            <span
                                key={i}
                                className="hour-chip"
                                title={`Reserva a las ${hora}`}
                            >
                {hora}
              </span>
                        ))}
                        {moreCount > 0 && (
                            <span className="hour-chip more-chip" title={`${moreCount} reservas más`}>
                +{moreCount}
              </span>
                        )}
                    </div>
                );
            }
        }
        return null;
    };

    if (loading) return <div className="page-container"><h2>Cargando...</h2></div>;
    if (!space) return <div className="page-container"><h2>Espacio no encontrado</h2></div>;

    return (
        <div className="page-container" style={{ maxWidth: 700, margin: '40px auto', textAlign: 'center' }}>
            <h1>{space.name}</h1>
            <img
                src={space.imageUrl}
                alt={space.name}
                style={{ width: 180, height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 20 }}
            />
            <p>{space.description}</p>
            <p><strong>Precio por hora: ${space.price}</strong></p>
            <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3>Calendario de Reservaciones</h3>
                <div style={{ borderRadius: 12, boxShadow: '0 2px 12px #0001', padding: 24, margin: '0 auto', background: '#1e1e1e' }}>
                    <Calendar
                        onChange={setSelectedDate}
                        value={selectedDate}
                        tileClassName={tileClassName}
                        tileContent={tileContent}
                        locale="es-ES"
                        minDate={new Date()}
                    />
                </div>
                <style>
                    {`
            .reserved-date {
              background: #ffecb3 !important;
              color: #b26a00 !important;
              border-radius: 50% !important;
              font-weight: bold;
            }
            .react-calendar__tile--active {
              background: #1976d2 !important;
              color: white !important;
              border-radius: 50% !important;
            }
            .react-calendar {
              width: 100% !important;
              max-width: 420px;
              font-size: 1.1rem;
              background-color: #1e1e1e !important;
              color: #fff !important;
              border-radius: 12px;
              box-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
            }
            .react-calendar__tile {
              background: transparent !important;
              color: #fff !important;
              border-radius: 8px;
              position: relative;
              padding-bottom: 18px !important; 
            }
            .hour-chip {
              background-color: #1976d2;
              color: white;
              border-radius: 12px;
              font-size: 10px;
              padding: 2px 6px;
              margin: 1px;
              white-space: nowrap;
              user-select: none;
            }
            .more-chip {
              background-color: #555;
            }
          `}
                </style>

                {selectedDate && (
                    <div style={{ marginTop: 24, textAlign: 'left', maxWidth: 420, width: '100%' }}>
                        <h4>Reservaciones para {selectedDate.toLocaleDateString()}</h4>
                        {reservations.filter(r => r.fecha === formatDate(selectedDate)).length === 0 ? (
                            <p style={{ color: '#888' }}>No hay reservaciones para este día.</p>
                        ) : (
                            <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                                {reservations
                                    .filter(r => r.fecha === formatDate(selectedDate))
                                    .sort((a, b) => a.hora.localeCompare(b.hora))
                                    .map(r => {
                                        const [hh, mm] = r.hora.split(':').map(Number);
                                        let finHH = hh + 1;
                                        let finMM = mm;
                                        if (finHH >= 24) finHH = finHH - 24;
                                        const horaFin = `${String(finHH).padStart(2, '0')}:${String(finMM).padStart(2, '0')}`;

                                        return (
                                            <li
                                                key={r.id}
                                                style={{
                                                    backgroundColor: '#1976d2',
                                                    color: 'white',
                                                    marginBottom: 6,
                                                    padding: '6px 12px',
                                                    borderRadius: 6,
                                                    fontWeight: 'bold',
                                                }}
                                                title={`Reserva de ${r.hora} a ${horaFin}`}
                                            >
                                                Hora de inicio: {r.hora} &mdash; Hora de fin: {horaFin}
                                            </li>
                                        );
                                    })}
                            </ul>
                        )}
                    </div>
                )}
            </div>
            <button
                className="btn-primary"
                style={{ marginTop: 30 }}
                onClick={() => navigate(-1)}
            >
                Volver
            </button>
        </div>
    );
};

export default SpaceCalendar;
