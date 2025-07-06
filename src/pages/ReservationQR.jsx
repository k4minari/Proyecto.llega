import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import QRCode from 'qrcode.react';

const ReservationQR = () => {
    const { id } = useParams();
    const [reservation, setReservation] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReservation = async () => {
            try {
                const docRef = doc(db, "reservations", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setReservation({ id: docSnap.id, ...docSnap.data() });
                }
            } finally {
                setLoading(false);
            }
        };
        fetchReservation();
    }, [id]);

    if (loading) return <h2>Cargando QR...</h2>;
    if (!reservation) return <h2>Reserva no encontrada.</h2>;

    const verifyUrl = `https://llega-unimet-1bd09.web.app/admin-qr-verify?reservationId=${reservation.id}&verificationCode=${reservation.verificationCode}`;

    return (
        <div style={{ textAlign: 'center', marginTop: 40 }}>
            <h2>QR de tu Reserva</h2>
            <QRCode value={verifyUrl} size={220} />
            <div style={{ marginTop: 20, wordBreak: 'break-all' }}>{verifyUrl}</div>
            <div style={{ marginTop: 20 }}>
                <button onClick={() => navigate('/mis-reservas')}>Volver</button>
            </div>
        </div>
    );
};

export default ReservationQR;