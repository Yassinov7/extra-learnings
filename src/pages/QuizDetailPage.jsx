import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';
import { useAuth } from '../contexts/AuthContext';
import QuestionForm from '../components/quizzes/QuestionForm';
import StudentQuizForm from '../components/quizzes/StudentQuizForm';
import { Link } from 'react-router-dom';
export default function QuizDetailPage() {
  const { quizId } = useParams();
  const { user, userData } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [courseOwnerId, setCourseOwnerId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQuiz = async () => {
    const { data } = await supabase
      .from('quizzes')
      .select('*')
      .eq('quiz_id', quizId)
      .single();

    setQuiz(data);

    // جلب صاحب الدورة
    if (data?.course_id) {
      const { data: courseData } = await supabase
        .from('courses')
        .select('created_by')
        .eq('course_id', data.course_id)
        .single();

      setCourseOwnerId(courseData?.created_by);
    }
  };

  const fetchQuestions = async () => {
    const { data } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', quizId);

    setQuestions(data || []);
  };

  useEffect(() => {
    fetchQuiz();
    fetchQuestions();
    setLoading(false);
  }, [quizId]);

  if (loading || !quiz) {
    return (
      <div className="min-h-screen bg-navy text-white flex justify-center items-center">
        <p className="text-lg font-noto">جارٍ تحميل الاختبار...</p>
      </div>
    );
  }

  const isTeacher = userData?.role === 'teacher' && user?.id === courseOwnerId;

  return (
    <div className="min-h-screen bg-navy text-white p-6 font-noto">
      <h1 className="text-2xl font-bold text-orange mb-4">{quiz.title}</h1>
      {isTeacher && (
        <Link
          to={`/quizzes/${quizId}/results`}
          className="inline-block mt-4 m-3 bg-orange text-white px-4 py-2 rounded hover:bg-orange-600 transition"
        >
          عرض نتائج الطلاب 📊
        </Link>
      )}
      {/* نموذج إضافة سؤال يظهر فقط للمعلم وصاحب الدورة */}
      {isTeacher && (
        <QuestionForm quizId={quizId} onAdded={fetchQuestions} />
      )}

      <h2 className="text-xl mt-6 mb-2 text-white border-b border-white pb-1">الأسئلة</h2>

      {questions.length === 0 ? (
        <p className="text-gray-300">لا توجد أسئلة بعد.</p>
      ) : userData?.role === 'teacher' ? (
        // عرض للمعلم مع الإجابات
        <ul className="space-y-4">
          {questions.map((q, index) => (
            <li key={q.question_id} className="bg-white text-black p-4 rounded shadow">
              <p className="font-bold mb-2">{index + 1}. {q.text}</p>
              <ul className="ml-4 text-sm space-y-1">
                {Object.entries(q.options).map(([key, value]) => (
                  <li key={key}>
                    {key}. {value} {q.correct_answer === key && <span className="text-green-600 font-bold">(✔)</span>}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        // عرض للطالب مع نموذج تفاعلي
        <StudentQuizForm quizId={quizId} questions={questions} />
      )}

    </div>
  );
}
