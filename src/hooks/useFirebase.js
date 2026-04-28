import { useEffect, useState } from 'react';
import { db, ref, onValue, off } from '../lib/firebase';

export const useFirebaseValue = (path) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!path) {
      setLoading(false);
      return;
    }
    
    const dbRef = ref(db, path);
    const unsubscribe = onValue(dbRef, (snapshot) => {
      setData(snapshot.val());
      setLoading(false);
    }, (error) => {
      console.error('Firebase error:', error);
      setLoading(false);
    });
    
    return () => off(dbRef);
  }, [path]);
  
  return { data, loading };
};
