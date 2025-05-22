import { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function MyCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          course_id,
          courses (
            course_id,
            title,
            description
          )
        `)
        .eq('user_id', user.id);

      if (!error && data) {
        setCourses(data.map(e => e.courses));
      }

      setLoading(false);
    };

    if (user?.id) fetchCourses();
  }, [user]);

  return (
    <div className="min-h-screen bg-navy text-white p-6 font-noto">
      <h1 className="text-2xl font-bold text-orange mb-4 text-center">دوراتي</h1>

      {loading ? (
        <p className="text-center text-gray-300">جارٍ التحميل...</p>
      ) : courses.length === 0 ? (
        <p className="text-center text-gray-300">لم تنضم إلى أي دورة بعد.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => (
            <Link
              key={course.course_id}
              to={`/courses/${course.course_id}`}
              className="bg-white text-black p-4 rounded shadow hover:bg-orange hover:text-white transition"
            >
              <h2 className="text-lg font-bold mb-2">{course.title}</h2>
              <p className="text-sm">{course.description?.slice(0, 100)}...</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
