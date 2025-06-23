// src/pages/Login.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config'; // Importamos auth y la base de datos (db)
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  GithubAuthProvider, // Importamos el proveedor de GitHub
  signInWithPopup 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore'; // Funciones para leer y escribir en Firestore

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- FUNCIÓN PARA INICIO DE SESIÓN CON EMAIL Y CONTRASEÑA ---
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (loading) return; // Evita que se envíe el formulario varias veces

    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); // Login exitoso, redirige al Home
    } catch (error) {
      setError('Error al iniciar sesión. Verifica tus credenciales.');
      console.error("Error en login con email:", error);
    }
    setLoading(false);
  };

  // --- FUNCIÓN GENÉRICA PARA INICIO DE SESIÓN CON PROVEEDORES EXTERNOS (Google, GitHub) ---
  const handleProviderLogin = async (provider) => {
    if (loading) return;

    setLoading(true);
    setError(null);
    try {
      // 1. Iniciar el popup de inicio de sesión de Firebase
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 2. ¡CRUCIAL! Revisamos si el usuario es nuevo para crear su perfil en Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // Si el documento del usuario NO existe, lo creamos con datos básicos
        console.log("Usuario nuevo detectado desde proveedor externo, creando perfil en Firestore...");
        await setDoc(userDocRef, {
          uid: user.uid,
          nombre: user.displayName || 'Usuario', // Nombre que provee Google/GitHub
          apellido: '', // Este campo puede quedar vacío o intentar sacarlo del displayName
          carnet: '', // Queda vacío
          nombreDeUsuario: user.displayName || user.email,
          correo: user.email,
          descripcion: '¡Hola! Soy un nuevo usuario en Llega.',
        });
      }

      // 3. Redirigir al usuario al Home
      navigate('/');

    } catch (error) {
      // Manejo de errores comunes
      if (error.code === 'auth/account-exists-with-different-credential') {
        setError('Ya existe una cuenta con este correo, pero con un método de inicio de sesión diferente.');
      } else {
        setError('Error al iniciar sesión. Inténtalo de nuevo.');
      }
      console.error("Error en login con proveedor:", error);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2 className="auth-title">llega</h2>
        <form onSubmit={handleEmailLogin}>
          <div className="input-group">
            <label>Correo Electrónico</label>
            <input
              type="email"
              placeholder="example@correo.unimet.edu.ve"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="input-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <Link to="/forgot-password" className="forgot-password">¿Has olvidado la contraseña?</Link>
          
          {error && <p className="error-message" style={{textAlign: 'center'}}>{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Iniciando...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="divider">o iniciar sesión con</div>
        
        <div className="provider-buttons">
          {/* Botón de Google */}
          <button onClick={() => handleProviderLogin(new GoogleAuthProvider())} className="btn-google" disabled={loading} aria-label="Iniciar sesión con Google">G</button>
          
          {/* Botón de GitHub */}
          <button onClick={() => handleProviderLogin(new GithubAuthProvider())} className="btn-github" disabled={loading} aria-label="Iniciar sesión con GitHub">
            <svg height="24" viewBox="0 0 16 16" version="1.1" width="24"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.19.01-.82.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.43 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21-.15.46-.55.38A8.013 8.013 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path></svg>
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