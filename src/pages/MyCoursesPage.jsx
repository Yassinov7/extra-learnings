import { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function MyCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // جلب التصنيفات
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('created_at', { ascending: false });

      if (!error && data) setCategories(data);
    };

    fetchCategories();
  }, []);

  // جلب الدورات الملتحق بها الطالب مع تفاصيلها (بما في ذلك category_id و cover_url)
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          course_id,
          courses:course_id (
            course_id,
            title,
            description,
            category_id,
            cover_url
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        setCourses([]);
      } else {
        // تأكد أن البيانات موجودة وصحيحة
        setCourses(data?.map(e => e.courses) || []);
      }

      setLoading(false);
    };

    if (user?.id) fetchCourses();
  }, [user]);

  // دالة لجلب اسم التصنيف حسب id
  const getCategoryName = (id) => {
    if (!id) return 'غير محدد';
    const category = categories.find((cat) => cat.id === id);
    return category ? category.name : 'غير محدد';
  };

  // فلترة الدورات بناءً على البحث والتصنيف
  const filteredCourses = courses.filter((course) => {
    const titleMatch = course.title?.toLowerCase().includes(searchTerm.toLowerCase());
    // المقارنة يجب أن تكون متوافقة بالنوع. قد تحتاج تحويل selectedCategory للنوع الصحيح.
    const categoryMatch =
      selectedCategory === 'all' || String(course.category_id) === String(selectedCategory);
    return titleMatch && categoryMatch;
  });

  return (
    <div className="min-h-screen bg-navy text-white p-6 font-noto">
      <h1 className="text-2xl font-bold text-orange mb-6 text-center">دوراتي</h1>

      {/* شريط البحث والفلترة */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-center items-center">
        <input
          type="text"
          placeholder="ابحث في الدورات..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 rounded-lg border border-gray-600 bg-navy text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange transition"
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full md:w-1/4 px-4 py-2 rounded-lg border border-gray-600 bg-navy text-white focus:outline-none focus:ring-2 focus:ring-orange transition"
        >
          <option value="all">جميع التصنيفات</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-center text-gray-300 text-lg">جارٍ التحميل...</p>
      ) : filteredCourses.length === 0 ? (
        <p className="text-center text-gray-400 text-lg">لا توجد دورات مطابقة للبحث أو الفلترة.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            // استخراج رابط الصورة - تأكد من تحميلها من storage بشكل صحيح
            let coverUrl = null;
            if (course.cover_url) {
              coverUrl = course.cover_url.startsWith('http')
                ? course.cover_url
                : supabase.storage.from('course-content').getPublicUrl(course.cover_url).publicUrl;
            }

            return (
              <Link
                key={course.course_id}
                to={`/courses/${course.course_id}`}
                className="bg-white text-navy rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition"
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
                  <h2 className="text-xl font-bold text-orange mb-1 truncate" title={course.title}>
                    {course.title}
                  </h2>
                  <p className="text-sm text-gray-600 font-semibold mb-2">
                    التصنيف: {getCategoryName(course.category_id)}
                  </p>
                  <p className="text-sm text-gray-700 flex-grow">
                    {course.description ? course.description.slice(0, 100) + '...' : 'لا يوجد وصف للدورة'}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
