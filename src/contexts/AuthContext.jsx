import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../api/supabase';



const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Supabase user object
  const [userData, setUserData] = useState(null); // metadata: name, role
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch session on load
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setUserData(currentUser?.user_metadata ?? null);
      setLoading(false);
    };

    fetchSession();

    // Listen to auth changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setUserData(currentUser?.user_metadata ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);
  
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserData(null);
    
  };

  return (
    <AuthContext.Provider value={{ user, userData, setUserData, loading, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
