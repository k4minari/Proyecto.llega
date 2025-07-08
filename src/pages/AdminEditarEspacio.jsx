import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const categories = [
    { label: 'Deportivo', value: 'deportivo' },
    { label: 'Educativo', value: 'educativo' },
    { label: 'Tecnología', value: 'tecnologia' },
    { label: 'Exposiciones', value: 'exposiciones' },
];

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

const cardStyle = {
    background: '#fff',
    border: '1.5px solid #e0e0e0',
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    padding: 20,
    margin: '12px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    minWidth: 260,
    maxWidth: 350,
};

const cardButtonStyle = {
    background: '#ff7300',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '8px 0',
    fontWeight: 600,
    fontSize: 15,
    cursor: 'pointer',
    marginTop: 8,
    transition: 'background 0.2s',
};

function isPastReservation(fecha, hora) {
    const [year, month, day] = fecha.split('-').map(Number);
    const [hour, minute] = hora.split(':').map(Number);
    const resDate = new Date(year, month - 1, day, hour, minute);
    return resDate < new Date();
}

const AdminEditarEspacio = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [form, setForm] = useState({
        name: '',
        description: '',
        imageUrl: '',
        type: '',
        price: '',
        supervisorId: '',
    });
    const [loading, setLoading] = useState(false);

    const [reservations, setReservations] = useState([]);
    const [resLoading, setResLoading] = useState(true);

    useEffect(() => {
        const fetchSpace = async () => {
            const docRef = doc(db, 'spaces', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setForm({
                    name: data.name || '',
                    description: data.description || '',
                    imageUrl: data.imageUrl || '',
                    type: data.type || '',
                    price: data.price !== undefined ? data.price : '',
                    supervisorId: data.supervisorId || '',
                });
            }
        };
        fetchSpace();
    }, [id]);

    useEffect(() => {
        const fetchReservations = async () => {
            setResLoading(true);
            try {
                const q = query(
                    collection(db, 'reservations'),
                    where('spaceId', '==', id)
                );
                const snap = await getDocs(q);
                const resList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setReservations(resList);
            } catch {
                setReservations([]);
            }
            setResLoading(false);
        };
        fetchReservations();
    }, [id]);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = { ...form, price: Number(form.price) };
            await updateDoc(doc(db, 'spaces', id), data);
            alert('Espacio actualizado correctamente.');
            navigate('/');
        } catch {
            alert('Error al actualizar el espacio.');
        }
        setLoading(false);
    };

    const handleViewFeedback = async (reservationId) => {
        const q = query(
            collection(db, 'feedback'),
            where('reservationId', '==', reservationId)
        );
        const snap = await getDocs(q);
        if (snap.empty) {
            alert('No hay feedback para esta reserva.');
        } else {
            const feedbackId = snap.docs[0].id;
            navigate(`/feedback-detail/${feedbackId}`);
        }
    };

    const pastReservations = reservations.filter(r => isPastReservation(r.fecha, r.hora));
    const futureReservations = reservations.filter(r => !isPastReservation(r.fecha, r.hora));

    return (
        <div
            style={{
                maxWidth: 1000,
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
            <h2 style={{ textAlign: 'center', marginBottom: 32 }}>Editar Espacio</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                    <label style={labelStyle}>Nombre</label>
                    <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={labelStyle}>Descripción</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        required
                        rows={3}
                        style={{ ...inputStyle, resize: 'vertical' }}
                    />
                </div>
                <div>
                    <label style={labelStyle}>Imagen (URL)</label>
                    <input
                        name="imageUrl"
                        value={form.imageUrl}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={labelStyle}>Categoría</label>
                    <select
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    >
                        <option value="">Selecciona una categoría</option>
                        {categories.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label style={labelStyle}>Precio</label>
                    <input
                        name="price"
                        type="number"
                        value={form.price}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                        min={0}
                    />
                </div>
                <div>
                    <label style={labelStyle}>Supervisor</label>
                    <input
                        name="supervisorId"
                        value={form.supervisorId}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    />
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
                    {loading ? 'Actualizando...' : 'Actualizar Espacio'}
                </button>
            </form>

            <div style={{ marginTop: 48 }}>
                <h3 style={{ marginBottom: 16 }}>Reservas Futuras</h3>
                {resLoading ? (
                    <p>Cargando reservas...</p>
                ) : futureReservations.length === 0 ? (
                    <p>No hay reservas futuras.</p>
                ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                        {futureReservations.map(r => (
                            <div key={r.id} style={cardStyle}>
                                <div><strong>Usuario:</strong> {r.userId}</div>
                                <div><strong>Fecha:</strong> {r.fecha}</div>
                                <div><strong>Hora:</strong> {r.hora}</div>
                                <button
                                    style={cardButtonStyle}
                                    onClick={() => navigate(`/qr/${r.id}`)}
                                >
                                    Ver QR
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <h3 style={{ margin: '40px 0 16px 0' }}>Reservas Pasadas</h3>
                {resLoading ? (
                    <p>Cargando reservas...</p>
                ) : pastReservations.length === 0 ? (
                    <p>No hay reservas pasadas.</p>
                ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                        {pastReservations.map(r => (
                            <div key={r.id} style={cardStyle}>
                                <div><strong>Usuario:</strong> {r.userId}</div>
                                <div><strong>Fecha:</strong> {r.fecha}</div>
                                <div><strong>Hora:</strong> {r.hora}</div>
                                <button
                                    style={cardButtonStyle}
                                    onClick={() => handleViewFeedback(r.id)}
                                >
                                    Ver Feedback
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminEditarEspacio;