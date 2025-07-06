// src/pages/Payment.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';


const PAYPAL_CLIENT_ID = "AW949SN6ow8koxf23Cwb7XDWD2aLiR_VPm9KZSuRSD83JJ2h-IMetZhHHHnzpVDyzI4Z3evu01TUvUqS"; 

const Payment = () => {
    const { reservationId } = useParams();
    const [reservation, setReservation] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReservation = async () => {
            if (!reservationId) return;
            try {
                const docRef = doc(db, 'reservations', reservationId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setReservation(docSnap.data());
                } else {
                    setError("La reserva que intentas pagar no existe.");
                }
            } catch (err) {
                setError("Error al cargar los datos de la reserva.");
            }
        };
        fetchReservation();
    }, [reservationId]);

    if (error) return <div className="page-container"><h2>Error</h2><p>{error}</p></div>;
    if (!reservation) return <div className="page-container"><h2>Cargando...</h2></div>;

    // --- Renderizado de la Página de Pago ---
    return (
        <div className="page-container" style={{maxWidth: '500px', margin: '40px auto', textAlign: 'center'}}>
            <h2>Confirmar Pago</h2>
            <div className="reservation-summary" style={{background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px'}}>
                <p>Estás a punto de pagar por tu reserva de:</p>
                <h3 style={{margin: '10px 0'}}>{reservation.spaceName}</h3>
                <p style={{fontSize: '1.5rem', fontWeight: 'bold'}}>Total a Pagar: <strong>${reservation.price} USD</strong></p>
            </div>
            
            <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID, currency: "USD" }}>
                <PayPalButtons
                    style={{ layout: "vertical" }}
                    createOrder={(data, actions) => {
                        return actions.order.create({
                            purchase_units: [{
                                description: `Reserva para ${reservation.spaceName} en Llega Unimet`,
                                amount: {
                                    value: reservation.price.toString(),
                                },
                            }],
                        });
                    }}
                    onApprove={async (data, actions) => {
                        const order = await actions.order.capture();
                        console.log("Pago exitoso:", order);
                        
                        try {
                            const reservationRef = doc(db, 'reservations', reservationId);
                            await updateDoc(reservationRef, {
                                status: 'paid',
                                paypalOrderId: order.id,
                                payerEmail: order.payer.email_address,
                            });
                            
                            alert('¡Pago completado con éxito!');
                            navigate('/mis-reservas');
                        } catch (err) {
                            console.error("Error al actualizar la reserva:", err);
                            alert("Tu pago fue procesado, pero hubo un error al confirmar tu reserva. Contacta a soporte.");
                        }
                    }}
                    onError={(err) => {
                        console.error("Error de PayPal:", err);
                        alert("Ocurrió un error con el pago. Por favor, inténtalo de nuevo.");
                    }}
                />
            </PayPalScriptProvider>
        </div>
    );
}

export default Payment;