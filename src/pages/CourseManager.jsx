// src/pages/CoursesManager.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import EditCourseForm from '../components/courses/EditCourseForm';
import toast from 'react-hot-toast';
import useCategories from '../hooks/useCategories';

export default function CoursesManager() {
  const { user, userData, loading } = useAuth();
  const { categories, loading: categoriesLoading } = useCategories();

  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState(null);
  const navigate = useNavigate();

  // حماية - توجيه غير المعلمين
  useEffect(() => {
    if (!loading && (!user || userData?.role !== 'teacher')) {
      navigate('/login');
    }
  }, [user, loading, userData, navigate]);

  // جلب الدورات
  const fetchCourses = async () => {
    setPageLoading(true);
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('خطأ في تحميل الدورات: ' + error.message);
    } else {
      setCourses(data);
      setFilteredCourses(data);
    }
    setPageLoading(false);
  };

  useEffect(() => {
    if (user) fetchCourses();
  }, [user]);

  // فلترة حسب التصنيف والبحث
  useEffect(() => {
    let filtered = [...courses];

    if (selectedCategory !== 'all') {
      // مع تحويل القيمة إلى عدد لأنه ربما القيمة القادمة من الـ select نص
      const catId = Number(selectedCategory);
      filtered = filtered.filter((course) => course.category_id === catId);
    }

    if (searchQuery.trim() !== '') {
      filtered = filtered.filter((course) =>
        course.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
      );
    }

    setFilteredCourses(filtered);
  }, [selectedCategory, searchQuery, courses]);

  // اسم التصنيف حسب id
  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : 'غير محدد';
  };

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
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-orange flex items-center gap-2">
          📚 إدارة دوراتي
        </h1>
        <Link
          to="/adding-course"
          className="bg-orange text-white px-5 py-3 rounded-lg shadow hover:bg-orange-600 transition whitespace-nowrap"
        >
          ➕ دورة جديدة
        </Link>
      </div>

      {/* فلترة وتصنيف وبحث */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-2 rounded bg-white text-navy outline-none"
          aria-label="اختيار تصنيف"
          disabled={categoriesLoading}
        >
          <option value="all">كل التصنيفات</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="ابحث في عناوين الدورات..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow p-2 rounded bg-white text-navy outline-none"
          aria-label="بحث في عناوين الدورات"
        />
      </div>

      {pageLoading || categoriesLoading ? (
        <p className="text-gray-300 text-center text-lg">جارٍ تحميل الدورات والتصنيفات...</p>
      ) : filteredCourses.length === 0 ? (
        <p className="text-gray-400 text-center text-lg">لا توجد دورات مطابقة.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => {
            // التعامل مع رابط الغلاف
            let coverUrl = null;
            if (course.cover_url) {
              coverUrl = course.cover_url.startsWith('http')
                ? course.cover_url
                : supabase.storage.from('course-content').getPublicUrl(course.cover_url).publicUrl;
            }

            return (
              <div
                key={course.course_id}
                className="bg-white text-navy rounded-xl shadow-lg overflow-hidden flex flex-col"
              >
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={`غلاف دورة ${course.title}`}
                    className="w-full h-40 object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                    لا توجد صورة غلاف
                  </div>
                )}

                <div className="p-4 flex flex-col flex-grow">
                  <h2
                    className="text-xl font-bold text-orange mb-1 truncate"
                    title={course.title}
                  >
                    {course.title}
                  </h2>
                  <p className="text-sm text-gray-600 mb-2 font-semibold">
                    التصنيف: {getCategoryName(course.category_id)}
                  </p>
                  <p className="text-sm text-gray-700 mb-4 flex-grow">
                    {course.description || 'لا يوجد وصف بعد'}
                  </p>

                  <div className="mt-auto flex flex-wrap gap-3">
                    <Link to={`/courses/${course.course_id}`} className="flex-grow">
                      <button className="w-full bg-orange text-white py-2 rounded-lg hover:bg-orange-600 transition">
                        محتوى الدورة
                      </button>
                    </Link>

                    <button
                      onClick={() => setEditingCourse(course)}
                      className="flex-grow bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      تعديل
                    </button>

                    <button
                      onClick={() => handleDelete(course.course_id)}
                      className="flex-grow bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editingCourse && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.6)] flex justify-center items-center z-50 p-4 overflow-auto">
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
