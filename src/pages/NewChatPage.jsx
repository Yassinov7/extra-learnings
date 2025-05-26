import { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function NewChatPage() {
  const { user } = useAuth();
  const [sharedUsers, setSharedUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      // 1. جلب دورات المستخدم
      const { data: myEnrolls, error: enrollErr } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', user.id);
      if (enrollErr || !myEnrolls) return console.error(enrollErr);
      const myCourseIds = myEnrolls.map(e => e.course_id);

      // 2. جلب بيانات الدورات
      const { data: courseData, error: courseErr } = await supabase
        .from('courses')
        .select('course_id, title, created_by')
        .in('course_id', myCourseIds);
      if (courseErr || !courseData) return console.error(courseErr);
      setCourses(courseData);

      // 3. جلب كل الاشتراكات
      const { data: allEnrolls, error: allErr } = await supabase
        .from('enrollments')
        .select('user_id, course_id')
        .in('course_id', myCourseIds);
      if (allErr || !allEnrolls) return console.error(allErr);
      const otherEnrolls = allEnrolls.filter(e => e.user_id !== user.id);

      // 4. جلب بيانات الطلاب
      const studentIds = Array.from(new Set(otherEnrolls.map(e => e.user_id)));
      const { data: students, error: stuErr } = await supabase
        .from('user_profiles')
        .select('user_id, name, username, role')
        .in('user_id', studentIds);
      if (stuErr || !students) return console.error(stuErr);
      const studentsWithCourses = students.map(st => {
        const yourCourses = otherEnrolls
          .filter(e => e.user_id === st.user_id)
          .map(e => e.course_id);
        return {
          ...st,
          courses: courseData.filter(c => yourCourses.includes(c.course_id)),
        };
      });

      // 5. جلب بيانات المعلمين
      const teacherIds = Array.from(new Set(
        courseData.map(c => c.created_by).filter(id => id !== user.id)
      ));
      const { data: teachers, error: teaErr } = await supabase
        .from('user_profiles')
        .select('user_id, name, username, role')
        .in('user_id', teacherIds);
      if (teaErr || !teachers) return console.error(teaErr);
      const teachersWithCourses = teachers.map(t => {
        const yourCourse = courseData.find(c => c.created_by === t.user_id);
        return {
          ...t,
          courses: yourCourse ? [yourCourse] : [],
        };
      });

      // 6. دمج وإزالة التكرار
      const merged = [...studentsWithCourses, ...teachersWithCourses];
      const unique = Array.from(
        new Map(merged.map(u => [u.user_id, u])).values()
      );
      setSharedUsers(unique);
    };

    if (user?.id) fetchData();
  }, [user]);

  const startChat = id => navigate(`/chat/${id}`);

  const filtered = sharedUsers.filter(u => {
    if (activeTab === 'teachers') return u.role === 'teacher';
    if (activeTab === 'students') return u.role !== 'teacher';
    if (activeTab === 'byCourse' && selectedCourse) {
      return u.courses.some(c => c.course_id === selectedCourse);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-navy text-white p-6 font-noto">
      <Link to="/chats" className="bg-gray-800 px-4 py-2 rounded hover:bg-orange-600 mb-4 inline-block">
        العودة
      </Link>
      <h1 className="text-2xl font-bold mb-4">ابدأ محادثة جديدة</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        {['all','teachers','students','byCourse'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded ${activeTab===tab?'bg-orange':'bg-gray-700'}`}
          >
            {{
              all: 'الكل',
              teachers: 'المعلمون',
              students: 'الطلاب',
              byCourse: 'حسب الدورة'
            }[tab]}
          </button>
        ))}
      </div>

      {activeTab==='byCourse' && (
        <select
          value={selectedCourse}
          onChange={e=>setSelectedCourse(e.target.value)}
          className="mb-6 p-2 bg-white text-black rounded"
        >
          <option value="">اختر دورة</option>
          {courses.map(c=>(
            <option key={c.course_id} value={c.course_id}>{c.title}</option>
          ))}
        </select>
      )}

      {filtered.length===0 ? (
        <p>لا يوجد مستخدمون في هذا الدورة.</p>
      ) : (
        <ul className="space-y-4">
          {filtered.map(u=>(
            <li key={u.user_id} className="bg-white text-black p-4 rounded shadow flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-xl text-gray-600">
                  {u.username?.[0] || u.name?.[0] || '?'}
                </div>
                <div>
                  <p className="font-bold">
                    {u.role === 'teacher'
                      ? u.name      // teachers show name
                      : u.username  // students show username
                    }
                  </p>
                  {u.courses.length>0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      {u.role==='teacher'
                        ? u.courses[0].title
                        : u.courses.map(c=>c.title).join('، ')
                      }
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={()=>startChat(u.user_id)}
                className="bg-orange px-4 py-2 rounded hover:bg-orange-600"
              >
                ابدأ المحادثة
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
