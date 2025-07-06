// src/App.jsx

// --- 1. Imports de React y Librerías ---
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// --- 2. Imports de tus Páginas ---
// (Todas las vistas de tu aplicación)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Reservation from './pages/Reservation';
import AdminPanel from './pages/AdminPanel';
import MyReservations from './pages/MyReservations'; // <-- AÑADIR ESTA PÁGINA
import Payment from './pages/Payment';             // <-- AÑADIR ESTA PÁGINA

// --- 3. Imports de tus Componentes y Hooks ---
// (Herramientas que ayudan a tus páginas)
import ProtectedRoute from './components/ProtectedRoute';         // Guardián para usuarios normales
import AdminProtectedRoute from './components/AdminProtectedRoute'; // Guardián para administradores
import ChatbotWidget from './components/ChatbotWidget';         // Tu chatbot
import useAuth from './hooks/useAuth';                          // Hook para saber quién está logueado
import EspaciosPorCategoria from './pages/EspaciosPorCategoria';
import AdminEspaciosPorCategoria from './pages/AdminEspaciosPorCategoria';
import EditarEspacio from './pages/AdminEditarEspacio.jsx';
import AdminCrearEspacio from './pages/AdminCrearEspacio';
import FeedbackDetail from './pages/FeedbackDetail';

import FeedbackForm from './pages/FeedbackForm';
import ReservationQR from './pages/ReservationQR';
import AdminQRVerify from './pages/AdminQRVerify';



// --- 4. Import de tus Estilos Globales ---
import './App.css';

function App() {
  // Obtenemos el usuario y el estado de carga desde nuestro hook personalizado
  const { currentUser, loading } = useAuth();

  // Es crucial mostrar un estado de "cargando" mientras Firebase verifica la sesión.
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>Cargando aplicación...</h2>
      </div>
    );
  }

  // Una vez verificado, renderizamos el sistema de rutas
  return (
    <Router>
      {/* El componente <Routes> decide qué página mostrar basado en la URL */}
      <Routes>

        {/* --- Rutas Públicas (Cualquiera puede verlas) --- */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* --- Rutas Protegidas (Solo para usuarios logueados) --- */}
        <Route 
          path="/profile" 
          element={<ProtectedRoute><Profile /></ProtectedRoute>} 
        />
        <Route 
          path="/reserva/:spaceId" 
          element={<ProtectedRoute><Reservation /></ProtectedRoute>} 
        />
        <Route path="/espacios" element={<EspaciosPorCategoria />} />
        <Route path="/feedback/:id"   element={<ProtectedRoute><FeedbackForm /></ProtectedRoute>}/>
        <Route path="/feedback-detail/:id" element={<ProtectedRoute><FeedbackDetail /></ProtectedRoute>} />
        {/* ▼▼▼ RUTAS NUEVAS AÑADIDAS ▼▼▼ */}
        <Route 
          path="/pago/:reservationId" 
          element={<ProtectedRoute><Payment /></ProtectedRoute>} 
        />
        <Route 
          path="/mis-reservas" 
          element={<ProtectedRoute><MyReservations /></ProtectedRoute>} 
        />
        {/* ▲▲▲ FIN DE RUTAS NUEVAS ▲▲▲ */}


        {/* --- Ruta de Administrador (Solo para usuarios con rol 'admin') --- */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminPanel />
            </AdminProtectedRoute>
          }
        />
        <Route path="/admin/espacios" element={<ProtectedRoute><AdminEspaciosPorCategoria /></ProtectedRoute>} />
        <Route path="/admin/editar-espacio/:id" element={<ProtectedRoute><EditarEspacio /></ProtectedRoute>} />
        <Route path="/admin/espacios/crear" element={<ProtectedRoute><AdminCrearEspacio /></ProtectedRoute>} />
        <Route path="/qr/:id" element={<ProtectedRoute><ReservationQR /></ProtectedRoute>} />
        <Route path="/admin/qr-verify" element={<ProtectedRoute><AdminQRVerify /></ProtectedRoute>} />
        <Route path="/admin-qr-verify" element={<ProtectedRoute><AdminQRVerify /></ProtectedRoute>} />
        {/* --- Ruta para Páginas No Encontradas (404) --- */}
        <Route path="*" element={
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>404 - Página No Encontrada</h1>
          </div>
        } />
        
      </Routes>
      
      {/* El Chatbot solo se muestra si hay un usuario con sesión iniciada */}
      {currentUser && <ChatbotWidget />}

    </Router>
  );
}

export default App;