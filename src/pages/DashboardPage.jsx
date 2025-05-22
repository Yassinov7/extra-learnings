import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';

export default function DashboardPage() {
  const { user, userData, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profileCreated, setProfileCreated] = useState(false);

  // إعادة التوجيه إن لم يكن هناك مستخدم
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // محاولة إدخال user_profiles إذا لم يكن موجودًا
  useEffect(() => {
    const insertProfile = async () => {
      if (!user || !userData || profileCreated) return;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (!data) {
        const { error: insertError } = await supabase.from('user_profiles').insert({
          user_id: user.id,
          name: userData.name,
          role: userData.role,
          email: user.email,
        });

        if (!insertError) {
          console.log('تم حفظ user_profiles بنجاح');
          setProfileCreated(true);
        } else {

          console.error('خطأ عند إدخال user_profiles:', insertError.message);
        }
      } else {
        setProfileCreated(true);
      }
    };

    insertProfile();
  }, [user, userData, profileCreated]);

  if (loading || !userData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-navy text-white font-noto">
        <p className="text-lg">جارٍ التحميل...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy text-white p-6 font-noto">
      <h1 className="text-2xl font-bold mb-4">مرحبًا، {userData.name}</h1>
      <p className="mb-4">
        أنت مسجل كـ{' '}
        <span className="text-orange font-semibold">
          {userData.role === 'teacher' ? 'معلم' : 'طالب'}
        </span>
      </p>

      <button
        onClick={signOut}
        className="bg-orange px-4 py-2 rounded-lg hover:bg-orange-600 transition"
      >
        تسجيل الخروج
      </button>
    </div>
  );
}
