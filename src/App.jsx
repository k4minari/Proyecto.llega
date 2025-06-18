// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importa todas tus páginas
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

// Importa los componentes y hooks necesarios
import ProtectedRoute from './components/ProtectedRoute'; // El guardián de las rutas
import ChatbotWidget from './components/ChatbotWidget';  // El chatbot
import useAuth from './hooks/useAuth';                 // El hook que verifica la sesión

// Importa tus estilos globales
import './App.css'; 

function App() {
  // Obtenemos el usuario actual y el estado de carga desde nuestro hook de autenticación
  const { currentUser, loading } = useAuth();

  // Es crucial mostrar un mensaje de carga mientras Firebase verifica si el usuario
  // tiene una sesión activa. Esto evita un parpadeo a la página de login.
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>Cargando aplicación...</h2>
      </div>
    );
  }

  return (
    <Router>
      {/* El componente <Routes> renderiza la primera ruta que coincida con la URL */}
      <Routes>
        
        {/* --- RUTA PRINCIPAL --- */}
        {/* La ruta raíz ("/") ahora muestra el componente Home a todos los visitantes. */}
        <Route path="/" element={<Home />} />
        
        {/* Rutas públicas para la gestión de usuarios */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rutas Protegidas: solo usuarios autenticados pueden acceder */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        {/* Puedes añadir más rutas protegidas aquí, como "/mis-reservas" */}
        
        {/* Ruta para manejar páginas no encontradas (404) */}
        <Route path="*" element={
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h1>404 - Página No Encontrada</h1>
            </div>
        } />
        
      </Routes>
      
      {/* 
        El Chatbot se renderiza aquí, fuera de <Routes>, para que sea persistente.
        Solo se muestra si `currentUser` es verdadero (si el usuario ha iniciado sesión).
      */}
      {currentUser && <ChatbotWidget />}
      
    </Router>
  );
}

export default App;