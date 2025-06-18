// src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth'; // Importamos nuestro hook

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth(); // Usamos el hook

  // 1. Mientras Firebase verifica si hay un usuario, mostramos un mensaje de carga.
  //    Esto evita que se redirija al login brevemente al recargar la página.
  if (loading) {
    return <div>Cargando, por favor espera...</div>;
  }

  // 2. Si ya terminó de cargar y NO hay un usuario, lo redirigimos al login.
  if (!currentUser) {
    return <Navigate to="/" />;
  }

  // 3. Si terminó de cargar y SÍ hay un usuario, mostramos la página protegida.
  return children;
};

export default ProtectedRoute;