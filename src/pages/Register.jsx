// src/pages/Register.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const Register = () => {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log('Form data:', formData);

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.correo, formData.password);
      const user = userCredential.user;

      console.log('User created:', user);

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        nombre: formData.nombre,
        apellido: formData.apellido,
        carnet: formData.carnet,
        nombreDeUsuario: formData.usuario,
        correo: formData.correo,
      });

      navigate('/');

    } catch (error) {
      console.error('Registration error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('Este correo electrónico ya está registrado.');
      } else if (error.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else {
        setError('Ocurrió un error al crear la cuenta.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="auth-container">
        <div className="auth-form">
          <h2 className="auth-title">Crear Cuenta</h2>
          <form onSubmit={handleRegister}>
            <div className="input-row">
              <div className="input-group">
                <label>Nombre</label>
                <input type="text" name="nombre" onChange={handleChange} required/>
              </div>
              <div className="input-group">
                <label>Apellido</label>
                <input type="text" name="apellido" onChange={handleChange} required/>
              </div>
            </div>
            <div className="input-group">
              <label>Carnet</label>
              <input type="text" name="carnet" onChange={handleChange} required/>
            </div>
            <div className="input-group">
              <label>Correo Unimet</label>
              <input type="email" name="correo" onChange={handleChange} required/>
            </div>
            <div className="input-group">
              <label>Nombre de usuario</label>
              <input type="text" name="usuario" onChange={handleChange} required/>
            </div>
            <div className="input-row">
              <div className="input-group">
                <label>Contraseña</label>
                <input type="password" name="password" onChange={handleChange} required/>
              </div>
              <div className="input-group">
                <label>Confirmar Contraseña</label>
                <input type="password" name="confirmPassword" onChange={handleChange} required/>
              </div>
            </div>

            {error && <p className="error-message">{error}</p>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>
          <div className="switch-auth">
            ¿Ya tienes una cuenta? <Link to="/login">Iniciar sesión</Link>
          </div>
        </div>
      </div>
  );
};

export default Register;