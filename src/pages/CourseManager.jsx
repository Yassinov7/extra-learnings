// src/pages/CoursesManager.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import EditCourseForm from '../components/courses/EditCourseForm';
import toast from 'react-hot-toast';

export default function CoursesManager() {
    const { user, userData, loading } = useAuth();
    const [courses, setCourses] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [editingCourse, setEditingCourse] = useState(null);
    const navigate = useNavigate();

    // الحماية - توجيه غير المعلمين
    useEffect(() => {
        if (!loading && (!user || userData?.role !== 'teacher')) {
            navigate('/login');
        }
    }, [user, loading, userData, navigate]);

    const fetchCourses = async () => {
        setPageLoading(true);
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .eq('created_by', user.id)
            .order('created_at', { ascending: false });

        if (data) setCourses(data);
        setPageLoading(false);
    };

    useEffect(() => {
        if (user) fetchCourses();
    }, [user]);

    const handleDelete = async (courseId) => {
        const confirm = window.confirm('هل أنت متأكد من حذف هذه الدورة؟');
        if (!confirm) return;

        const { error } = await supabase.from('courses').delete().eq('course_id', courseId);
        if (error) {
            toast.error('فشل في حذف الدورة: ' + error.message);

        } else {
            toast.success('✅ تم حذف الدورة');
            fetchCourses();
        }
    };

    return (
        <div className="min-h-screen bg-navy text-white font-noto p-6 relative">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-orange">📚 إدارة دوراتي</h1>
                <Link
                    to="/adding-course"
                    className="bg-orange text-white px-4 py-2 rounded hover:bg-orange-600"
                >
                    ➕ دورة جديدة
                </Link>
            </div>

            {pageLoading ? (
                <p className="text-gray-300">جارٍ تحميل الدورات...</p>
            ) : courses.length === 0 ? (
                <p className="text-gray-400">لا توجد دورات حاليًا.</p>
            ) : (
                <div className="space-y-4">
                    {courses.map((course) => (
                        <div key={course.course_id} className="bg-white text-black p-4 rounded shadow">
                            <h2 className="text-xl font-bold text-orange mb-2">{course.title}</h2>
                            <p className="text-sm text-gray-700 mb-2">{course.description || 'لا يوجد وصف بعد'}</p>

                            <div className="flex gap-2">
                                <Link to={`/courses/${course.course_id}`}>
                                    <button className="mt-auto bg-orange text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition w-full">
                                        محتوى الدورة
                                    </button>
                                </Link>
                                <button
                                    onClick={() => setEditingCourse(course)}
                                    className="bg-orange text-white px-4 py-2 rounded hover:bg-orange-600"
                                >
                                    تعديل
                                </button>
                                <button
                                    onClick={() => handleDelete(course.course_id)}
                                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                >
                                    حذف
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* نموذج التعديل داخل نافذة منبثقة */}
            {editingCourse && (
                <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-50 p-4">
                    <EditCourseForm
                        course={editingCourse}
                        onClose={() => setEditingCourse(null)}
                        onSaved={fetchCourses}
                    />
                </div>
            )}
        </div>
    );
}
