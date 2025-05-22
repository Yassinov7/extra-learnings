import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function RedirectToLogin() {
  const { user, loading } = useAuth();

  if (loading) return <p className="text-white text-center mt-10">جارٍ التحقق...</p>;

  return user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
}
