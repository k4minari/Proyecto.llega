import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const AdminQRVerify = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('Verificando...');

    useEffect(() => {
        const reservationId = searchParams.get('reservationId');
        const verificationCode = searchParams.get('verificationCode');
        if (!reservationId || !verificationCode) {
            setStatus('QR inválido.');
            return;
        }
        const checkReservation = async () => {
            const docRef = doc(db, 'reservations', reservationId);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) {
                setStatus('Reserva no encontrada.');
                return;
            }
            const res = docSnap.data();
            if (res.verificationCode === verificationCode) {
                setStatus('Reserva válida ✅');
            } else {
                setStatus('Código de verificación incorrecto ❌');
            }
        };
        checkReservation();
    }, [searchParams]);

    return (
        <div style={{ textAlign: 'center', marginTop: 40 }}>
            <h2>Verificación de Reserva</h2>
            <div style={{ fontWeight: 700, marginTop: 10 }}>{status}</div>
        </div>
    );
};

export default AdminQRVerify;