// src/pages/Register.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config'; // Importamos auth y la base de datos (db)
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; // Importamos funciones de Firestore

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    carnet: '',
    correo: '',
    usuario: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Validar que las contraseñas coinciden
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    try {
      // 2. Crear el usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, formData.correo, formData.password);
      const user = userCredential.user;

      // 3. Guardar los datos adicionales del usuario en Firestore
      // Se creará un documento en la colección "users" con el ID del usuario
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        nombre: formData.nombre,
        apellido: formData.apellido,
        carnet: formData.carnet,
        nombreDeUsuario: formData.usuario,
        correo: formData.correo,
        // ¡NUNCA guardes la contraseña en la base de datos!
      });

      // 4. Redirigir al usuario a la página de inicio
      navigate('/');

    } catch (error) {
      // 5. Manejar errores comunes de Firebase
      console.error("Error en el registro:", error.code);
      if (error.code === 'auth/email-already-in-use') {
        setError('Este correo electrónico ya está registrado.');
      } else if (error.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else {
        setError('Ocurrió un error al crear la cuenta. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false); // Detenemos la carga, tanto si tuvo éxito como si no
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2 className="auth-title">llega</h2>
        <form onSubmit={handleRegister}>
          {/* ... Todos tus campos del formulario se quedan igual ... */}
           <div className="input-row">
            <div className="input-group">
              <label>Nombre</label>
              <input type="text" name="nombre" onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Apellido</label>
              <input type="text" name="apellido" onChange={handleChange} required />
            </div>
          </div>
          <div className="input-group">
            <label>Carnet</label>
            <input type="text" name="carnet" onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Correo Unimet</label>
            <input type="email" name="correo" placeholder="example@correo.unimet.edu.ve" onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Nombre de usuario</label>
            <input type="text" name="usuario" onChange={handleChange} required />
          </div>
          <div className="input-row">
            <div className="input-group">
              <label>Contraseña</label>
              <input type="password" name="password" onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Confirmar Contraseña</label>
              <input type="password" name="confirmPassword" onChange={handleChange} required />
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