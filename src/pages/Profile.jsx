// src/pages/Profile.jsx

import React, { useState, useEffect } from 'react';

const Profile = () => {
  // En un futuro, los datos vendrían de Firebase
  const [profileData, setProfileData] = useState({
    nombreDeUsuario: 'NombreDeUsuario',
    nombre: 'Frank',
    apellido: 'Sandoval',
    carnet: '2023-1234',
    descripcion: 'Supervisor de espacio en Centro Mundo X.',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    console.log('Actualizando perfil:', profileData);
    // Aquí irá la lógica para actualizar los datos en Firestore
    setMessage('Información actualizada con éxito (simulación).');
    setTimeout(() => setMessage(''), 3000);
  };
  
  return (
    <div className="page-container">
      <h2 className="page-title">Modificar Perfil</h2>
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar-placeholder">👤</div>
          <h3>{profileData.nombreDeUsuario}</h3>
        </div>
        <form onSubmit={handleUpdate} className="profile-form">
          <div className="input-group">
            <label>Nombre de usuario</label>
            <input type="text" name="nombreDeUsuario" value={profileData.nombreDeUsuario} onChange={handleChange} />
          </div>
          <div className="input-row">
            <div className="input-group">
              <label>Nombre</label>
              <input type="text" name="nombre" value={profileData.nombre} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Apellido</label>
              <input type="text" name="apellido" value={profileData.apellido} onChange={handleChange} />
            </div>
          </div>
          <div className="input-group">
            <label>Carnet</label>
            <input type="text" name="carnet" value={profileData.carnet} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Descripción</label>
            <textarea name="descripcion" value={profileData.descripcion} onChange={handleChange} rows="4"></textarea>
          </div>

          {message && <p className="success-message">{message}</p>}

          <div className="form-actions">
            <button type="button" className="btn btn-secondary">Cancelar</button>
            <button type="submit" className="btn btn-primary">Actualizar Información</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;