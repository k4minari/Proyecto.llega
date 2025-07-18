import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
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

const AdminCrearEspacio = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        description: '',
        imageUrl: '',
        type: '',
        price: '',
        supervisorId: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = { ...form, price: Number(form.price) };
            await addDoc(collection(db, 'spaces'), data);
            alert('Espacio creado correctamente.');
            navigate('/');
        } catch (error) {
            alert('Error al crear el espacio.');
        }
        setLoading(false);
    };

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
            <h2 style={{ textAlign: 'center', marginBottom: 32 }}>Crear Espacio</h2>
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
                    {loading ? 'Creando...' : 'Crear Espacio'}
                </button>
            </form>
        </div>
    );
};

export default AdminCrearEspacio;