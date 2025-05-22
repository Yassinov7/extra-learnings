import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';

export default function CourseResultsPage() {
  const { courseId } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzesWithStats = async () => {
      const { data: quizList } = await supabase
        .from('quizzes')
        .select('quiz_id, title')
        .eq('course_id', courseId);

      const enriched = await Promise.all(
        quizList.map(async (quiz) => {
          const { data: submissions } = await supabase
            .from('submissions')
            .select('score')
            .eq('quiz_id', quiz.quiz_id);

          const avg =
            submissions.length > 0
              ? (
                  submissions.reduce((sum, s) => sum + parseFloat(s.score), 0) /
                  submissions.length
                ).toFixed(2)
              : null;

          return {
            ...quiz,
            total: submissions.length,
            average: avg,
          };
        })
      );

      setQuizzes(enriched);
      setLoading(false);
    };

    fetchQuizzesWithStats();
  }, [courseId]);

  return (
    <div className="min-h-screen bg-navy text-white p-6 font-noto">
      <h1 className="text-2xl font-bold text-orange mb-4 text-center">
        نتائج طلاب الدورة
      </h1>

      {loading ? (
        <p className="text-center">جارٍ تحميل البيانات...</p>
      ) : (
        <ul className="space-y-4">
          {quizzes.map((quiz) => (
            <li
              key={quiz.quiz_id}
              className="bg-white text-black p-4 rounded shadow"
            >
              <p className="font-bold text-lg text-navy">{quiz.title}</p>
              <p>عدد المشاركين: {quiz.total}</p>
              <p>
                المتوسط:{" "}
                {quiz.average !== null ? (
                  <span className="text-green-600 font-bold">
                    {quiz.average}%
                  </span>
                ) : (
                  <span className="text-gray-500">لم يُجرى بعد</span>
                )}
              </p>

              <div className="mt-3 space-x-2">
                <Link
                  to={`/quizzes/${quiz.quiz_id}/results`}
                  className="bg-orange text-white px-4 py-2 rounded hover:bg-orange-600"
                >
                  عرض التفاصيل
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
    