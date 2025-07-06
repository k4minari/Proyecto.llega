// src/pages/Profile.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'; // Importamos todas las funciones necesarias

const Profile = () => {
  const navigate = useNavigate();
  // Empezamos el estado como `null` para poder diferenciar entre "cargando" y "no encontrado"
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // useEffect se ejecuta una vez cuando el componente se carga, gracias al array vacío `[]`
  useEffect(() => {
    const fetchOrCreateProfile = async () => {
      const user = auth.currentUser; // Obtenemos el usuario actual de Firebase Auth
      if (user) {
        const userDocRef = doc(db, 'users', user.uid); // Referencia al documento del usuario
        
        try {
          const docSnap = await getDoc(userDocRef);
          
          if (docSnap.exists()) {
            // Si el perfil ya existe en Firestore, cargamos sus datos en el estado
            setProfileData(docSnap.data());
          } else {
            // Si el perfil NO existe, lo creamos con datos por defecto
            console.log("Perfil no encontrado, creando uno nuevo para el usuario:", user.uid);
            const newProfileData = {
              uid: user.uid,
              nombre: user.displayName?.split(' ')[0] || '', // Intenta obtener el nombre de Google/GitHub
              apellido: user.displayName?.split(' ')[1] || '', // Intenta obtener el apellido
              carnet: '', // Este campo quedará vacío para que lo rellene
              nombreDeUsuario: user.displayName || user.email,
              correo: user.email,
              descripcion: '¡Hola! Soy un nuevo usuario en Llega.',
            };
            await setDoc(userDocRef, newProfileData); // Creamos el documento en la base de datos
            setProfileData(newProfileData); // Y cargamos los datos nuevos en el estado
          }
        } catch (err) {
          console.error("Error al cargar o crear el perfil:", err);
          setError("No se pudieron cargar los datos del perfil.");
        }
      }
      setLoading(false); // Terminamos de cargar
    };

    fetchOrCreateProfile();
  }, []); // El array vacío asegura que este efecto se ejecute solo una vez

  // Función para manejar los cambios en los inputs del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prevData => ({ ...prevData, [name]: value }));
  };

  // Función para guardar los cambios en Firestore
  const handleUpdate = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    setSuccess('');
    setError('');

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, profileData);
      setSuccess('¡Perfil actualizado con éxito!');
      setTimeout(() => setSuccess(''), 3000); // El mensaje de éxito desaparece después de 3 segundos
    } catch (err) {
      console.error("Error al actualizar el perfil:", err);
      setError("Hubo un error al guardar los cambios.");
    }
  };

  // --- Renderizado Condicional ---
  if (loading) {
    return <div className="page-container">Cargando perfil...</div>;
  }

  if (error) {
    return <div className="page-container">{error}</div>;
  }

  // --- Formulario Principal ---
  return (
    <div className="page-container">
      <h2 className="page-title">Modificar Perfil</h2>
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar-placeholder">👤</div>
          <h3>{profileData?.nombreDeUsuario || 'Cargando...'}</h3>
        </div>
        <form onSubmit={handleUpdate} className="profile-form">
          <div className="input-group">
            <label>Nombre de usuario</label>
            <input type="text" name="nombreDeUsuario" value={profileData?.nombreDeUsuario || ''} onChange={handleChange} />
          </div>
          <div className="input-row">
            <div className="input-group">
              <label>Nombre</label>
              <input type="text" name="nombre" value={profileData?.nombre || ''} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Apellido</label>
              <input type="text" name="apellido" value={profileData?.apellido || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="input-group">
            <label>Carnet</label>
            <input type="text" name="carnet" value={profileData?.carnet || ''} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Descripción</label>
            <textarea name="descripcion" value={profileData?.descripcion || ''} onChange={handleChange} rows="4"></textarea>
          </div>

          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/')} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">Actualizar Información</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;