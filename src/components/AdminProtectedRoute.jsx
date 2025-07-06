// src/components/AdminProtectedRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useAdminStatus from '../hooks/useAdminStatus';

const AdminProtectedRoute = ({ children }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminStatus(currentUser);

  // Mientras se verifica si hay usuario O si es admin, mostramos un mensaje
  if (authLoading || adminLoading) {
    return <div>Verificando permisos de administrador...</div>;
  }

  // Si después de cargar, no hay usuario o el usuario NO es admin...
  if (!currentUser || !isAdmin) {
    console.log("Acceso denegado. No es admin o no está logueado.");
    // ...lo redirigimos a la página de inicio.
    return <Navigate to="/" />;
  }

  // Si todo está bien (hay usuario Y es admin), mostramos la página protegida.
  console.log("Acceso concedido. ¡Bienvenido, admin!");
  return children;
};

export default AdminProtectedRoute;