import useCourses from '../hooks/useCourses';
import CourseCard from '../components/courses/CourseCard';

export default function CoursesPage() {
  const { courses, loading, error } = useCourses();

  return (
    <div className="min-h-screen bg-navy text-white p-4 font-noto">
      <h1 className="text-2xl font-bold mb-6 text-orange text-center">الدورات المتاحة</h1>

      {loading && <p className="text-center text-white">جارٍ تحميل الدورات...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && courses.length === 0 && (
        <p className="text-center text-gray-300">لا توجد دورات حاليًا.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard key={course.course_id} course={course} />
        ))}
      </div>
    </div>
  );
}
