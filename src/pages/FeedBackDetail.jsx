import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const renderStars = (count) => (
    <div style={{ display: 'flex', gap: 2 }}>
        {[1,2,3,4,5].map(i => (
            <span key={i} style={{ color: i <= count ? '#FFD600' : '#ccc', fontSize: 28 }}>★</span>
        ))}
    </div>
);

const FeedbackDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [feedback, setFeedback] = useState(null);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const fetch = async () => {
            try {
                const snap = await getDoc(doc(db, 'feedback', id));
                if (snap.exists()) {
                    const data = snap.data();
                    setFeedback(data);
                    if (data.userId) {
                        const userSnap = await getDoc(doc(db, 'users', data.userId));
                        if (userSnap.exists()) {
                            setUserName(userSnap.data().nombre || '');
                        }
                    }
                } else {
                    navigate('/');
                }
            } catch {
                navigate('/');
            }
        };
        fetch();
    }, [id, navigate]);

    if (!feedback) return <div style={{textAlign: 'center', marginTop: 60}}>Cargando...</div>;

    return (
        <div style={{maxWidth: 600, margin: '60px auto', padding: 32}}>
            <div
                style={{
                    background: '#fff',
                    border: '1px solid #ddd',
                    borderRadius: 16,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
                    padding: 32,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                }}
            >
                {renderStars(feedback.stars)}
                <div style={{ margin: '18px 0', color: '#333', fontSize: 18 }}>
                    {feedback.comment}
                </div>
                <div style={{ fontSize: 14, color: '#888' }}>
                    {userName ? `Usuario: ${userName}` : ''}
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                <button onClick={() => navigate(-1)}>Volver</button>
            </div>
        </div>
    );
};

export default FeedbackDetail;