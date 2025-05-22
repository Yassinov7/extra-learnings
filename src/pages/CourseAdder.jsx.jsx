import CourseForm from '../components/courses/CourseForm';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CourseAdder() {
  const { userData, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && userData?.role !== 'teacher') {
      navigate('/dashboard');
    }
  }, [userData, loading, navigate]);

  return (
    <div className="min-h-screen bg-navy text-white p-6 font-noto">
      <CourseForm onCreated={() => alert('تمت إضافة الدورة بنجاح')} />
    </div>
  );
}
