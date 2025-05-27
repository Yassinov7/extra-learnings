import { useState, useMemo } from 'react';
import useCourses from '../hooks/useCourses';
import CourseCard from '../components/courses/CourseCard';

const PAGE_SIZE = 6;

export default function CoursesPage() {
  const { courses, loading, error } = useCourses();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filtered and paginated courses
  const filteredCourses = useMemo(() => {
    return courses.filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, courses]);

  const totalPages = Math.ceil(filteredCourses.length / PAGE_SIZE);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-navy text-white py-8 px-4 font-noto">
      <h1 className="text-3xl font-bold mb-6 text-orange text-center">الدورات المتاحة</h1>

      <div className="max-w-md mx-auto mb-6">
        <input
          type="text"
          placeholder="ابحث عن دورة..."
          className="w-full p-2 rounded-lg border border-gray-300 text-white"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {loading && <p className="text-center">جارٍ تحميل الدورات...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && filteredCourses.length === 0 && (
        <p className="text-center text-gray-300">لا توجد دورات تطابق البحث.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {paginatedCourses.map((course) => (
          <CourseCard key={course.course_id} course={course} />
        ))}
      </div>

      {/* Pagination Controls */}
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
