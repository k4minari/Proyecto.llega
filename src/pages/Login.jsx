import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { useAuthMediator } from '../pages/AuthMediator';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { login, providerLogin, loading, error } = useAuthMediator();

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        const success = await login(email, password);
        if (success) navigate('/');
    };

    const handleProviderLogin = async (provider) => {
        const success = await providerLogin(provider);
        if (success) navigate('/');
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

                    {error && <p className="error-message" style={{ textAlign: 'center' }}>{error}</p>}

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Iniciando...' : 'Iniciar sesión'}
                    </button>
                </form>

                <div className="divider">o iniciar sesión con</div>

                <div className="provider-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                        onClick={() => handleProviderLogin(new GoogleAuthProvider())}
                        disabled={loading}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '100%', padding: '10px', border: '1px solid #ccc',
                            backgroundColor: '#fff', color: '#000', fontWeight: '500',
                            fontSize: '14px', cursor: 'pointer', gap: '10px', borderRadius: '6px'
                        }}
                    >
                        <FcGoogle size={20} /> Iniciar con Google
                    </button>

                    <button
                        onClick={() => handleProviderLogin(new GithubAuthProvider())}
                        disabled={loading}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '100%', padding: '10px', border: 'none', backgroundColor: '#24292e',
                            color: '#fff', fontWeight: '500', fontSize: '14px', cursor: 'pointer',
                            gap: '10px', borderRadius: '6px'
                        }}
                    >
                        <FaGithub size={20} /> Iniciar con GitHub
                    </button>
                </div>

                <div className="switch-auth" style={{ marginTop: '1rem' }}>
                    ¿No tienes una cuenta? <Link to="/register">Regístrate</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;