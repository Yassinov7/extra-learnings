import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';
import { BookOpen, MessageCircle, User, LayoutDashboard } from 'lucide-react';

export default function DashboardPage() {
  const { user, userData, loading, } = useAuth();
  const navigate = useNavigate();
  const [courseCount, setCourseCount] = useState(0);

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);
  useEffect(() => {
    const insertProfile = async () => {
      if (!user || !userData) return;

      const { data } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (!data) {
        await supabase.from('user_profiles').insert({
          user_id: user.id,
          name: userData.name,
          role: userData.role,
          email: user.email,
          username: userData.username || user.email.split('@')[0],
          avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=0D8ABC&color=fff`
        });
      }
    };

    insertProfile();
  }, [user, userData]);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user || !userData) return;

      const table = userData.role === 'teacher' ? 'courses' : 'enrollments';
      const column = userData.role === 'teacher' ? 'created_by' : 'user_id';

      const { data, error } = await supabase
        .from(table)
        .select('course_id')
        .eq(column, user.id);

      if (!error) {
        setCourseCount(data?.length || 0);
      }
    };

    fetchCourses();
  }, [user, userData]);

  if (loading || !userData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-navy text-white font-noto">
        <p className="text-lg">جارٍ التحميل...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy text-white font-noto">

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange to-yellow-500 p-6 text-navy">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              👋 مرحباً <br />{userData.name}!
            </h1>
            <p className="text-lg">
              أنت معنا كـ{' '}
              <span className="font-bold text-white">
                {userData.role === 'teacher' ? 'معلم' : 'طالب'}
              </span>
              ، نتمنى لك رحلة تعليمية مثمرة 🎯
            </p>
          </div>
          <img
            src={`https://ui-avatars.com/api/?name=${userData.name}&background=fff&color=0D3B66&size=128`}
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-white shadow"
          />
        </div>
      </section>

      {/* إحصائيات */}
      <section className="max-w-5xl mx-auto p-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white text-navy p-5 rounded-lg shadow-md flex items-center gap-4">
          <BookOpen size={32} className="text-orange" />
          <div>
            <p className="text-sm text-gray-600">عدد الدورات</p>
            <p className="text-xl font-bold">{courseCount}</p>
          </div>
        </div>

        <div className="bg-white text-navy p-5 rounded-lg shadow-md flex items-center gap-4">
          <MessageCircle size={32} className="text-orange" />
          <div>
            <p className="text-sm text-gray-600">رسائلك</p>
            <Link to="/chats" className="text-orange underline text-sm">الدخول للمحادثات</Link>
          </div>
        </div>

        <div className="bg-white text-navy p-5 rounded-lg shadow-md flex items-center gap-4">
          <User size={32} className="text-orange" />
          <div>
            <p className="text-sm text-gray-600">الملف الشخصي</p>
            <Link to="/profile" className="text-orange underline text-sm">تعديل الملف</Link>
          </div>
        </div>
      </section>

      {/* روابط سريعة */}
      <section className="max-w-5xl mx-auto px-6 pb-10">
        <h2 className="text-xl font-semibold mb-4 text-white">🚀 الوصول السريع</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {userData.role === 'student' && (
            <>
              <Link to="/my-courses" className="bg-white text-navy px-5 py-2 rounded-lg shadow hover:bg-orange hover:text-white transition font-semibold">📘 دوراتي</Link>
              <Link to="/my-results" className="bg-white text-navy px-5 py-2 rounded-lg shadow hover:bg-orange hover:text-white transition font-semibold">🏅 نتائجي</Link>
              <Link to="/courses" className="bg-white text-navy px-5 py-2 rounded-lg shadow hover:bg-orange hover:text-white transition font-semibold">📚 جميع الدورات</Link>
            </>
          )}

          {userData.role === 'teacher' && (
            <>
              <Link to="/managing-courses" className="bg-white text-navy px-5 py-2 rounded-lg shadow hover:bg-orange hover:text-white transition font-semibold">🛠 إدارة الدورات</Link>
              <Link to="/courses" className="bg-white text-navy px-5 py-2 rounded-lg shadow hover:bg-orange hover:text-white transition font-semibold">📚 عرض الدورات</Link>
            </>
          )}

          <Link to="/chats" className="bg-white text-navy px-5 py-2 rounded-lg shadow hover:bg-orange hover:text-white transition font-semibold">💬 المحادثات</Link>
        </div>
      </section>
    </div>
  );
}
