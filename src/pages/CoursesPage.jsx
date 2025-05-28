// pages/CoursesPage.jsx
import { useState, useMemo, useEffect } from 'react';
import useCourses from '../hooks/useCourses';
import useCategories from '../hooks/useCategories';
import CourseCard from '../components/courses/CourseCard';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE = 6;

export default function CoursesPage() {
  const { courses, loading, error } = useCourses();
  const { categories } = useCategories();
  const { userData } = useAuth();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // مساعدة لإيجاد اسم التصنيف
  const getCategoryName = (catId) => {
    const cat = categories.find(c => Number(c.id) === Number(catId));
    return cat ? cat.name : 'بدون تصنيف';
  };

  // تصفية الدورات
  const filteredCourses = useMemo(() => {
    return courses
      .filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(course =>
        selectedCategory === 'all' || Number(course.category_id) === Number(selectedCategory)
      );
  }, [courses, searchTerm, selectedCategory]);

  const totalPages = Math.ceil(filteredCourses.length / PAGE_SIZE);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // معالجة البحث
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // معالجة اختيار التصنيف
  const handleCategoryClick = (catId) => {
    setSelectedCategory(catId);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-navy text-white py-8 px-4 font-noto">
      <div className="flex justify-between items-center mb-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-orange">📚 الدورات المتاحة</h1>
        {userData?.role === 'teacher' && (
          <button
            onClick={() => navigate('/categories')}
            className="bg-orange text-white px-4 py-2 rounded hover:bg-orange-600 transition"
          >
            ➕ إدارة التصنيفات
          </button>
        )}
      </div>

      {/* تبويبات التصنيفات */}
      <div className="flex flex-wrap gap-3 justify-center mb-6">
        <button
          onClick={() => handleCategoryClick('all')}
          className={`px-4 py-2 rounded-full border ${selectedCategory === 'all'
              ? 'bg-orange text-white'
              : 'bg-white text-navy'
            }`}
        >
          الكل
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            className={`px-4 py-2 rounded-full border ${Number(selectedCategory) === Number(cat.id)
                ? 'bg-orange text-white'
                : 'bg-white text-navy'
              }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* صندوق البحث */}
      <div className="max-w-md mx-auto mb-6">
        <input
          type="text"
          placeholder="ابحث عن دورة..."
          className="w-full p-2 rounded-lg border border-gray-300 bg-transparent text-white focus:outline-none"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {/* حالات */}
      {loading && <p className="text-center">جارٍ تحميل الدورات...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      {!loading && filteredCourses.length === 0 && (
        <p className="text-center text-gray-300">لا توجد دورات تطابق البحث أو التصنيف المحدد.</p>
      )}

      {/* عرض الكورسات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 max-w-6xl mx-auto">
        {paginatedCourses.map(course => (
          <CourseCard
            key={course.course_id}
            course={course}
            categoryName={getCategoryName(course.category_id)}
          />
        ))}
      </div>

      {/* الترقيم */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`px-4 py-2 rounded-lg ${currentPage === i + 1
                  ? 'bg-orange text-white'
                  : 'bg-white text-navy hover:bg-orange-100'
                }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
