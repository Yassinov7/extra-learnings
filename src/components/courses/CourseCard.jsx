import { Link } from 'react-router-dom';

export default function CourseCard({ course }) {
    const coverImage = course.cover_url || '/placeholder-image.jpg';

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col transition hover:scale-[1.02] duration-300 h-full">
            {/* Cover Image */}
            <div className="w-full h-44 sm:h-48 md:h-56 bg-gray-200">
                <img
                    src={coverImage}
                    alt={`صورة دورة ${course.title}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-image.jpg';
                    }}
                />
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col justify-between flex-grow font-noto text-right">
                <div>
                    <h3 className="text-lg sm:text-xl font-bold text-navy mb-2">{course.title}</h3>
                    <p className="text-gray-700 text-sm sm:text-base line-clamp-3 mb-4">{course.description}</p>
                </div>

                <Link to={`/courses/${course.course_id}`} className="mt-auto">
                    <button className="bg-orange text-white w-full py-2 px-4 rounded-lg hover:bg-orange-600 transition">
                        عرض الدورة
                    </button>
                </Link>
            </div>
        </div>
    );
}
