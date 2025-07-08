import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const SpaceContext = createContext();

export const SpaceProvider = ({ spaceId, children }) => {
    const [space, setSpace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSpace = async () => {
            if (!spaceId) {
                setError('No se proporcionó un ID de espacio.');
                setLoading(false);
                return;
            }
            try {
                const docRef = doc(db, 'spaces', spaceId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setSpace({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setError('El documento del espacio no fue encontrado.');
                }
            } catch (err) {
                setError('Ocurrió un error técnico al buscar el espacio.');
            } finally {
                setLoading(false);
            }
        };
        fetchSpace();
    }, [spaceId]);

    return (
        <SpaceContext.Provider value={{ space, loading, error }}>
            {children}
        </SpaceContext.Provider>
    );
};

export const useSpace = () => useContext(SpaceContext);