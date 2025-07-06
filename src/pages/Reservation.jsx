import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import useAuth from '../hooks/useAuth';
import { v4 as uuidv4 } from 'uuid';


const Reservation = () => {
    const { spaceId } = useParams();
    const [searchParams] = useSearchParams();
    const fecha = searchParams.get('fecha');
    const hora = searchParams.get('hora');
    const [space, setSpace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [feedbacks, setFeedbacks] = useState([]);
    const [feedbacksLoading, setFeedbacksLoading] = useState(true);

    useEffect(() => {
        const fetchSpace = async () => {
            if (!spaceId) {
                setError("No se proporcionó un ID de espacio.");
                setLoading(false);
                return;
            }
            try {
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

    useEffect(() => {
        const fetchFeedbacks = async () => {
            if (!spaceId) return;
            setFeedbacksLoading(true);
            try {
                const q = query(
                    collection(db, 'feedback'),
                    where('spaceId', '==', spaceId)
                );
                const snap = await getDocs(q);
                const feedbacksRaw = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                const feedbacksWithUser = await Promise.all(
                    feedbacksRaw.map(async fb => {
                        let userName = '';
                        if (fb.userId) {
                            try {
                                const userSnap = await getDoc(doc(db, 'users', fb.userId));
                                userName = userSnap.exists() ? userSnap.data().name || '' : '';
                            } catch {
                                userName = '';
                            }
                        }
                        return { ...fb, userName };
                    })
                );
                setFeedbacks(feedbacksWithUser);
            } catch (err) {
                console.error('Error fetching feedbacks:', err);
            } finally {
                setFeedbacksLoading(false);
            }
        };
        fetchFeedbacks();
    }, [spaceId]);

    const handleReservation = async () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        try {
            const verificationCode = uuidv4();
            const reservationData = {
                userId: currentUser.uid,
                spaceId: space.id,
                spaceName: space.name,
                status: 'pending',
                createdAt: serverTimestamp(),
                price: space.price,
                fecha: fecha || null,
                hora: hora || null,
                verificationCode,
            };
            const docRef = await addDoc(collection(db, "reservations"), reservationData);
            navigate(`/pago/${docRef.id}`);
        } catch (error) {
            console.error("Error al crear la reserva: ", error);
            alert("Hubo un problema al intentar crear tu reserva.");
        }
    };

    const renderStars = (count) => (
        <div style={{ display: 'flex', gap: 2 }}>
            {[1,2,3,4,5].map(i => (
                <span key={i} style={{ color: i <= count ? '#FFD600' : '#ccc', fontSize: 20 }}>★</span>
            ))}
        </div>
    );
    const previewComment = (text, max = 80) =>
        text.length > max ? text.slice(0, max) + '…' : text;

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

    return (
        <div className="page-container" style={{maxWidth: '500px', margin: '40px auto', textAlign: 'center'}}>
            <h1 className="page-title">Página de Reserva</h1>
            <div className="reservation-card-detail" style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}}>
                <img src={space.imageUrl} alt={space.name} style={{width: '100%', borderRadius: '8px', marginBottom: '20px'}} />
                <h2>{space.name}</h2>
                <p>{space.description}</p>
                <hr style={{margin: '15px 0'}} />
                <p><strong>Precio por hora: ${space.price}</strong></p>
                <p><strong>Fecha seleccionada:</strong> {fecha || 'No seleccionada'}</p>
                <p><strong>Hora seleccionada:</strong> {hora || 'No seleccionada'}</p>
                {space.supervisorId ? (
                    <p>Supervisor de espacio: <strong>{space.supervisorId}</strong></p>
                ) : (
                    <p>Supervisor de espacio: No asignado</p>
                )}
                <button onClick={handleReservation} className="btn-primary" style={{width: '100%', marginTop: '20px'}}>
                    Reservar Ya
                </button>
            </div>

            {/* Feedbacks section */}
            <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ marginBottom: 16, textAlign: 'center' }}>Comentarios de otros usuarios</h3>
                {feedbacksLoading ? (
                    <p style={{ color: '#888', textAlign: 'center' }}>Cargando feedbacks...</p>
                ) : feedbacks.length === 0 ? (
                    <p style={{ color: '#888', textAlign: 'center' }}>Aún no hay feedback para este espacio.</p>
                ) : (
                    <div
                        style={{
                            display: 'flex',
                            overflowX: 'auto',
                            gap: 20,
                            paddingBottom: 10,
                            justifyContent: 'center',
                        }}
                    >
                        {feedbacks.map(fb => (
                            <div
                                key={fb.id}
                                onClick={() => navigate(`/feedback-detail/${fb.id}`)}
                                style={{
                                    minWidth: 260,
                                    maxWidth: 260,
                                    background: '#fff',
                                    border: '1px solid #ddd',
                                    borderRadius: 10,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                                    padding: 18,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    transition: 'box-shadow 0.2s',
                                }}
                            >
                                {renderStars(fb.stars)}
                                <div style={{ margin: '10px 0', color: '#333', fontSize: 15 }}>
                                    {previewComment(fb.comment)}
                                </div>
                                <div style={{ fontSize: 13, color: '#888' }}>
                                    {fb.userName ? `Usuario: ${fb.userName}` : ''}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reservation;