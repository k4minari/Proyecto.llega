import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import QRCode from 'qrcode.react';

const ReservationQR = () => {
    const { id } = useParams();
    const [reservation, setReservation] = useState(null);
    const [space, setSpace] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReservation = async () => {
            try {
                const docRef = doc(db, "reservations", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const reservationData = { id: docSnap.id, ...docSnap.data() };
                    setReservation(reservationData);

                    // Fetch space data
                    if (reservationData.spaceId) {
                        const spaceRef = doc(db, "spaces", reservationData.spaceId);
                        const spaceSnap = await getDoc(spaceRef);
                        if (spaceSnap.exists()) {
                            setSpace({ id: spaceSnap.id, ...spaceSnap.data() });
                        }
                    }
                }
            } finally {
                setLoading(false);
            }
        };
        fetchReservation();
    }, [id]);

    if (loading) return <h2>Cargando QR...</h2>;
    if (!reservation) return <h2>Reserva no encontrada.</h2>;

    const verifyUrl = `https://llega-unimet.firebaseapp.com/admin-qr-verify?reservationId=${reservation.id}&verificationCode=${reservation.verificationCode}`;

    return (
        <div style={{ textAlign: 'center', marginTop: 40 }}>
            <h2>QR de tu Reserva</h2>
            <QRCode value={verifyUrl} size={220} />
            <div style={{ marginTop: 20, wordBreak: 'break-all' }}>{verifyUrl}</div>
            <div style={{ marginTop: 30, fontSize: 18 }}>
                <div><strong>Espacio:</strong> {space ? space.name : 'Cargando...'}</div>
                <div><strong>Fecha:</strong> {reservation.fecha || 'No especificada'}</div>
                <div><strong>Hora:</strong> {reservation.hora || 'No especificada'}</div>
            </div>
            <div style={{ marginTop: 20 }}>
                <button onClick={() => navigate('/mis-reservas')}>Volver</button>
            </div>
        </div>
    );
};

export default ReservationQR;