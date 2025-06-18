// src/pages/Login.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config'; // <-- ASEGÚRATE DE QUE ESTO ESTÁ BIEN
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  GithubAuthProvider, // <-- IMPORTAMOS GITHUB
  signInWithPopup 
} from 'firebase/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); // Redirige al Home después del login
    } catch (error) {
      setError('Error al iniciar sesión. Verifica tus credenciales.');
      console.error("Error en login con email:", error);
    }
    setLoading(false);
  };

  const handleProviderLogin = async (provider) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, provider);
      navigate('/'); // Redirige al Home después del login
    } catch (error) {
      setError('Error al iniciar sesión con un proveedor externo.');
      console.error("Error en login con proveedor:", error);
    }
    setLoading(false);
  }

  const handleGoogleLogin = () => {
    const googleProvider = new GoogleAuthProvider();
    handleProviderLogin(googleProvider);
  };
  
  const handleGithubLogin = () => {
    const githubProvider = new GithubAuthProvider();
    handleProviderLogin(githubProvider);
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2 className="auth-title">llega</h2>
        <form onSubmit={handleLogin}>
          {/* ... campos de email y contraseña (sin cambios) ... */}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Iniciando...' : 'Iniciar sesión'}
          </button>
        </form>
        <div className="divider">o iniciar sesión con</div>
        <div className="provider-buttons">
          <button onClick={handleGoogleLogin} className="btn-google" disabled={loading}>G</button>
          <button onClick={handleGithubLogin} className="btn-github" disabled={loading}>
            {/* Puedes usar un ícono de GitHub aquí */}
            <svg height="24" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="24" data-view-component="true">
                <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.19.01-.82.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.43 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21-.15.46-.55.38A8.013 8.013 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
            </svg>
          </button>
        </div>
        <div className="switch-auth">
          ¿No tienes una cuenta? <Link to="/register">Regístrate</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;