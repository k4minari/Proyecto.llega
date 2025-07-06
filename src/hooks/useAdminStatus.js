// src/hooks/useAdminStatus.js
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const useAdminStatus = (user) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists() && docSnap.data().role === 'admin') {
          setIsAdmin(true);
        }
      }
      setLoading(false);
    };

    checkAdminStatus();
  }, [user]);

  return { isAdmin, loading };
};

export default useAdminStatus;