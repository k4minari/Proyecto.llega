import React, { createContext, useContext, useState } from 'react';
import { auth, db } from '../firebase/config';
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    GithubAuthProvider,
    fetchSignInMethodsForEmail,
    linkWithCredential
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthMediatorContext = createContext();

export const AuthMediatorProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const isUnimetEmail = (email) => email.endsWith('@correo.unimet.edu.ve');

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setLoading(false);
            return true;
        } catch (err) {
            setError('Error al iniciar sesión. Verifica tus credenciales.');
            setLoading(false);
            return false;
        }
    };

    const providerLogin = async (provider) => {
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
                return false;
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

            setLoading(false);
            return true;
        } catch (error) {
            if (error.code === 'auth/account-exists-with-different-credential') {
                const email = error.customData.email;
                const pendingCred = error.credential;
                const methods = await fetchSignInMethodsForEmail(auth, email);

                if (methods.includes('password')) {
                    const password = prompt('Ya existe una cuenta con este correo. Por favor ingresa tu contraseña para vincular tu cuenta de Google/GitHub:');
                    if (!password) {
                        setError('Debes ingresar la contraseña para vincular tu cuenta.');
                        setLoading(false);
                        return false;
                    }

                    try {
                        const userCred = await signInWithEmailAndPassword(auth, email, password);
                        await linkWithCredential(userCred.user, pendingCred);
                        setLoading(false);
                        return true;
                    } catch (err) {
                        setError('No se pudo vincular el proveedor. Verifica tu contraseña.');
                        setLoading(false);
                        return false;
                    }
                } else {
                    setError('Ya existe una cuenta con este correo con otro método. Intenta iniciar sesión con ese método.');
                }
            } else {
                setError('Error al iniciar sesión. Inténtalo de nuevo.');
            }
            setLoading(false);
            return false;
        }
    };

    return (
        <AuthMediatorContext.Provider value={{ login, providerLogin, loading, error }}>
            {children}
        </AuthMediatorContext.Provider>
    );
};

export const useAuthMediator = () => useContext(AuthMediatorContext);