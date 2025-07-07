import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';

const isUnimetEmail = (email) => email.endsWith('@correo.unimet.edu.ve');

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error) {
      setError('Error al iniciar sesión. Verifica tus credenciales.');
      console.error("Error en login con email:", error);
    }
    setLoading(false);
  };

  const handleProviderLogin = async (provider) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const email = user.email;
      if (!isUnimetEmail(email)) {
        await auth.signOut();
        setError('Solo se permiten correos unimet');
        setLoading(false);
        return;
      }

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          nombre: user.displayName || 'Usuario',
          apellido: '',
          carnet: '',
          nombreDeUsuario: user.displayName || user.email,
          correo: user.email,
          descripcion: '¡Hola! Soy un nuevo usuario en Llega.',
          role: "normal"
        });
      }

      navigate('/');
    } catch (error) {
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

              <div className="provider-buttons" style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                  <button
                      onClick={() => handleProviderLogin(new GoogleAuthProvider())}
                      disabled={loading}
                      style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ccc',
                          backgroundColor: '#fff',
                          color: '#000',
                          fontWeight: '500',
                          fontSize: '14px',
                          cursor: 'pointer',
                          gap: '10px',
                          borderRadius: '6px'
                      }}
                  >
                      <FcGoogle size={20}/>
                      Iniciar con Google
                  </button>

                  <button
                      onClick={() => handleProviderLogin(new GithubAuthProvider())}
                      disabled={loading}
                      style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                          padding: '10px',
                          border: 'none',
                          backgroundColor: '#24292e',
                          color: '#fff',
                          fontWeight: '500',
                          fontSize: '14px',
                          cursor: 'pointer',
                          gap: '10px',
                          borderRadius: '6px'
                      }}
                  >
                      <FaGithub size={20}/>
                      Iniciar con GitHub
                  </button>
              </div>

              <div className="switch-auth" style={{marginTop: '1rem'}}>
                  ¿No tienes una cuenta? <Link to="/register">Regístrate</Link>
              </div>
          </div>
      </div>
  )
      ;
};

export default Login;
