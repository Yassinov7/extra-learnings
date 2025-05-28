import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';
import { BookOpen, MessageCircle, User } from 'lucide-react';
import useAvatarQuery from '../hooks/useAvatarQuery';
import { useUserProfileSync } from '../hooks/useUserProfileSync';


export default function DashboardPage() {
  const { user, userData, loading } = useAuth();
  const navigate = useNavigate();
  const [courseCount, setCourseCount] = useState(0);
  const { avatarUrl } = useAvatarQuery();

  // استدعاء هوك مزامنة الملف الشخصي، ليجلب أو ينشئ الملف في قاعدة البيانات
  const { profile, loading: profileLoading } = useUserProfileSync(user);

  // توجيه المستخدم للصفحة تسجيل الدخول إن لم يكن مسجّل الدخول
  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);

  // جلب عدد الدورات أو التسجيلات بحسب دور المستخدم
  useEffect(() => {
    const fetchCourses = async () => {
      if (!user || !profile) return;

      const table = profile.role === 'teacher' ? 'courses' : 'enrollments';
      const column = profile.role === 'teacher' ? 'created_by' : 'user_id';

      const { data, error } = await supabase
        .from(table)
        .select('course_id')
        .eq(column, user.id);

      if (!error) {
        setCourseCount(data?.length || 0);
      }
    };

    fetchCourses();
  }, [user, profile]);

  // عرض تحميل إذا كانت البيانات لا زالت تتحمل
  if (loading || profileLoading || !profile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-navy text-white font-noto">
        <p className="text-lg">جارٍ التحميل...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy text-white font-noto">
      <section className="bg-gradient-to-r from-orange to-yellow-500 p-6 text-navy">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              👋 مرحباً <br />{profile.name}!
            </h1>
            <p className="text-lg">
              أنت معنا كـ{' '}
              <span className="font-bold text-white">
                {profile.role === 'teacher' ? 'معلم' : 'طالب'}
              </span>
              ، نتمنى لك رحلة تعليمية مثمرة 🎯
            </p>
          </div>
          <img
            src={avatarUrl || profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=0D8ABC&color=fff`}
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-white shadow"
          />
        </div>
      </section>

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

      <section className="max-w-5xl mx-auto px-6 pb-10">
        <h2 className="text-xl font-semibold mb-4 text-white">🚀 الوصول السريع</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {profile.role === 'student' && (
            <>
              <Link to="/my-courses" className="bg-white text-navy px-5 py-2 rounded-lg shadow hover:bg-orange hover:text-white transition font-semibold">📘 دوراتي</Link>
              <Link to="/my-results" className="bg-white text-navy px-5 py-2 rounded-lg shadow hover:bg-orange hover:text-white transition font-semibold">🏅 نتائجي</Link>
              <Link to="/courses" className="bg-white text-navy px-5 py-2 rounded-lg shadow hover:bg-orange hover:text-white transition font-semibold">📚 جميع الدورات</Link>
            </>
          )}

          {profile.role === 'teacher' && (
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
