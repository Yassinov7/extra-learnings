import { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function MyResultsPage() {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          score,
          submitted_at,
          quizzes (
            quiz_id,
            title,
            course_id
          )
        `)
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false });

      if (!error && data) {
        setResults(data);
      }

      setLoading(false);
    };

    if (user?.id) fetchResults();
  }, [user]);

  return (
    <div className="min-h-screen bg-navy text-white p-6 font-noto">
      <h1 className="text-2xl font-bold text-orange mb-4 text-center">نتائجي</h1>

      {loading ? (
        <p className="text-center text-gray-300">جارٍ تحميل النتائج...</p>
      ) : results.length === 0 ? (
        <p className="text-center text-gray-300">لم تقم بحل أي اختبار بعد.</p>
      ) : (
        <ul className="space-y-4">
          {results.map((res, i) => (
            <li key={i} className="bg-white text-black p-4 rounded shadow">
              <h2 className="text-lg font-bold text-navy mb-1">{res.quizzes.title}</h2>
              <p>الدرجة: <span className="font-bold text-green-600">{res.score}%</span></p>
              <p className="text-sm text-gray-600">بتاريخ: {new Date(res.submitted_at).toLocaleString()}</p>
              <Link
                to={`/courses/${res.quizzes.course_id}`}
                className="inline-block mt-2 text-orange underline hover:text-orange-600"
              >
                العودة إلى الدورة
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
