import { Link } from 'react-router-dom';

export default function CourseCard({ course }) {
    return (
        <div className="bg-white rounded-xl shadow-md p-4 flex flex-col justify-between h-full font-noto">
            <div>
                <h3 className="text-xl font-bold text-navy mb-2">{course.title}</h3>
                <p className="text-gray-700 text-sm mb-4 line-clamp-3">{course.description}</p>
            </div>

            <Link to={`/courses/${course.course_id}`}>
                <button className="mt-auto bg-orange text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition w-full">
                    عرض الدورة
                </button>
            </Link>
        </div>
    );
}
