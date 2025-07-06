import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, addDoc, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import useAuth from '../hooks/useAuth';

const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1.5px solid #222',
    background: '#333',
    color: '#fff',
    fontSize: 16,
    outline: 'none',
    boxSizing: 'border-box',
};

const labelStyle = {
    display: 'block',
    marginBottom: 6,
    fontWeight: 500,
};

const FeedbackForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [comment, setComment] = useState('');
    const [stars, setStars] = useState(5);
    const [loading, setLoading] = useState(false);
    const [spaceId, setSpaceId] = useState('');
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const fetchReservation = async () => {
            const resRef = doc(db, 'reservations', id);
            const resSnap = await getDoc(resRef);
            if (resSnap.exists()) {
                const data = resSnap.data();
                setSpaceId(data.spaceId);
                if (currentUser && data.userId === currentUser.uid) {
                    setAuthorized(true);
                } else {
                    alert('No tienes permiso para dejar feedback en esta reserva.');
                    navigate('/mis-reservas');
                }
            } else {
                alert('Reserva no encontrada.');
                navigate('/mis-reservas');
            }
        };
        if (currentUser) fetchReservation();
    }, [id, navigate, currentUser]);

    const handleSubmit = async e => {
        e.preventDefault();
        if (!currentUser || !authorized) return;
        setLoading(true);
        try {
            await addDoc(collection(db, 'feedback'), {
                comment,
                spaceId,
                userId: currentUser.uid,
                stars: Number(stars),
                createdAt: new Date()
            });
            await deleteDoc(doc(db, 'reservations', id));
            alert('¡Gracias por tu feedback!');
            navigate('/mis-reservas');
        } catch (err) {
            alert('Error al enviar feedback.');
        }
        setLoading(false);
    };

    const renderStars = () => (
        <div style={{ display: 'flex', gap: 6, cursor: 'pointer', fontSize: 28 }}>
            {[1, 2, 3, 4, 5].map(n => (
                <span
                    key={n}
                    onClick={() => setStars(n)}
                    style={{
                        color: n <= stars ? '#FFD600' : '#ccc',
                        transition: 'color 0.2s',
                        userSelect: 'none'
                    }}
                    role="button"
                    aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
                    tabIndex={0}
                    onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') setStars(n);
                    }}
                >
                    ★
                </span>
            ))}
        </div>
    );

    if (!authorized) return null;

    return (
        <div
            style={{
                maxWidth: 600,
                width: '100%',
                margin: '48px auto',
                background: '#fff',
                borderRadius: 16,
                boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
                padding: 32,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                boxSizing: 'border-box'
            }}
        >
            <h2 style={{ textAlign: 'center', marginBottom: 32 }}>Dejar Feedback</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                    <label style={labelStyle}>Comentario</label>
                    <textarea
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        required
                        rows={4}
                        style={{ ...inputStyle, resize: 'vertical' }}
                    />
                </div>
                <div>
                    <label style={labelStyle}>Estrellas</label>
                    {renderStars()}
                </div>
                <button
                    type="submit"
                    style={{
                        marginTop: 12,
                        background: '#ff7300',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '12px 0',
                        fontWeight: 600,
                        fontSize: 17,
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                    }}
                    disabled={loading}
                >
                    {loading ? 'Enviando...' : 'Enviar Feedback'}
                </button>
            </form>
        </div>
    );
};

export default FeedbackForm;