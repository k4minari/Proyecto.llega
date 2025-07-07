import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const PAYPAL_CLIENT_ID = "AW949SN6ow8koxf23Cwb7XDWD2aLiR_VPm9KZSuRSD83JJ2h-IMetZhHHHnzpVDyzI4Z3evu01TUvUqS";

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const reservationData = location.state?.reservationData;

    if (!reservationData) {
        return (
            <div className="page-container">
                <h2>Error</h2>
                <p>Datos de la reservación no encontrados.</p>
            </div>
        );
    }

    return (
        <div className="page-container" style={{maxWidth: '500px', margin: '40px auto', textAlign: 'center'}}>
            <h2>Confirmar Pago</h2>
            <div className="reservation-summary" style={{background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px'}}>
                <p>Vas a pagar por la reservación de:</p>
                <h3 style={{margin: '10px 0'}}>{reservationData.spaceName}</h3>
                <p style={{fontSize: '1.5rem', fontWeight: 'bold'}}>Total: <strong>${reservationData.price} USD</strong></p>
            </div>

            <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID, currency: "USD", "disable-funding": "paylater" }}>
                <PayPalButtons
                    style={{ layout: "vertical" }}
                    createOrder={(data, actions) => {
                        return actions.order.create({
                            purchase_units: [{
                                description: `Reservation for ${reservationData.spaceName}`,
                                amount: {
                                    value: reservationData.price.toString(),
                                },
                            }],
                        });
                    }}
                    onApprove={async (data, actions) => {
                        const order = await actions.order.capture();
                        try {
                            await addDoc(collection(db, 'reservations'), {
                                ...reservationData,
                                status: 'paid',
                                paypalOrderId: order.id,
                                payerEmail: order.payer.email_address,
                                createdAt: new Date(),
                            });
                            alert('Pago realizado!');
                            navigate('/mis-reservas');
                        } catch (err) {
                            console.error("Error creating reservation:", err);
                            alert("Hubo un error. Te recomendamos crear un ticket con el administrador.");
                        }
                    }}
                    onError={(err) => {
                        console.error("PayPal error:", err);
                        alert("Hubo un error con el pago. Intenta de nuevo.");
                    }}
                />
            </PayPalScriptProvider>
        </div>
    );
};

export default Payment;