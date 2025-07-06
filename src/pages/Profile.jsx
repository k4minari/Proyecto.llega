// src/pages/Profile.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const Profile = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchOrCreateProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);

        try {
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            setProfileData(docSnap.data());
          } else {
            const newProfileData = {
              uid: user.uid,
              nombre: user.displayName?.split(' ')[0] || '',
              apellido: user.displayName?.split(' ')[1] || '',
              carnet: '',
              nombreDeUsuario: user.displayName || user.email,
              correo: user.email,
              descripcion: '¡Hola! Soy un nuevo usuario en Llega.',
            };
            await setDoc(userDocRef, newProfileData);
            setProfileData(newProfileData);
          }
        } catch (err) {
          console.error("Error al cargar o crear el perfil:", err);
          setError("No se pudieron cargar los datos del perfil.");
        }
      }
      setLoading(false);
    };

    fetchOrCreateProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prevData => ({ ...prevData, [name]: value }));
  };

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
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error("Error al actualizar el perfil:", err);
      setError("Hubo un error al guardar los cambios.");
    }
  };

  if (loading) {
    return <div className="page-container">Cargando perfil...</div>;
  }

  if (error) {
    return <div className="page-container">{error}</div>;
  }

  return (
      <div className="page-container">
        <div className="form-container">
          <form onSubmit={handleUpdate} className="profile-form">
            <h2 className="form-title">Modificar Perfil</h2>
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

            <button type="submit" className="btn-primary">Actualizar Información</button>
            <button type="button" onClick={() => navigate('/')} className="btn-cancel">Cancelar</button>
          </form>
        </div>
      </div>
  );
};

export default Profile;