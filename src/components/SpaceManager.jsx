// src/components/SpaceManager.jsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

const SpaceManager = () => {
  const [spaces, setSpaces] = useState([]);
  const [newSpace, setNewSpace] = useState({
    name: '',
    type: '',
    description: '',
    price: 0,
    imageUrl: ''
  });

  // Función para cargar los espacios desde Firestore
  const fetchSpaces = async () => {
    const spacesSnapshot = await getDocs(collection(db, 'spaces'));
    setSpaces(spacesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSpace(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSpace = async (e) => {
    e.preventDefault();
    if (!newSpace.name || !newSpace.type) {
      alert("Nombre y tipo son obligatorios.");
      return;
    }
    await addDoc(collection(db, 'spaces'), {
        ...newSpace,
        price: Number(newSpace.price) // Asegurarnos de que el precio es un número
    });
    setNewSpace({ name: '', type: '', description: '', price: 0, imageUrl: '' }); // Limpiar formulario
    fetchSpaces(); // Recargar la lista de espacios
  };

  const handleDeleteSpace = async (spaceId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este espacio?")) {
        await deleteDoc(doc(db, 'spaces', spaceId));
        fetchSpaces(); // Recargar la lista
    }
  };

  return (
    <div>
      <h3>Añadir Nuevo Espacio</h3>
      <form onSubmit={handleAddSpace} className="space-form">
        <input name="name" value={newSpace.name} onChange={handleInputChange} placeholder="Nombre del Espacio" required />
        <input name="type" value={newSpace.type} onChange={handleInputChange} placeholder="Tipo (ej: Educativo)" required />
        <textarea name="description" value={newSpace.description} onChange={handleInputChange} placeholder="Descripción"></textarea>
        <input name="price" value={newSpace.price} type="number" onChange={handleInputChange} placeholder="Precio" />
        <input name="imageUrl" value={newSpace.imageUrl} onChange={handleInputChange} placeholder="URL de la Imagen" />
        <button type="submit" className="btn-primary">Añadir Espacio</button>
      </form>

      <hr style={{margin: '30px 0'}}/>

      <h3>Lista de Espacios Actuales</h3>
      <ul className="spaces-list">
        {spaces.map(space => (
          <li key={space.id}>
            <span>{space.name} ({space.type})</span>
            <div>
              {/* <button className="btn-edit">Editar</button> (Funcionalidad futura) */}
              <button onClick={() => handleDeleteSpace(space.id)} className="btn-delete">Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SpaceManager;