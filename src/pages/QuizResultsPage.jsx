import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../api/supabase';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';
import { saveAs } from 'file-saver';
export default function QuizResultsPage() {
  const { quizId } = useParams();
  const [results, setResults] = useState([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // جلب عنوان الاختبار
      const { data: quiz } = await supabase
        .from('quizzes')
        .select('title')
        .eq('quiz_id', quizId)
        .single();

      setQuizTitle(quiz?.title || 'اختبار بدون عنوان');

      // جلب النتائج بدون join
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('submitted_at', { ascending: false });

      if (!error && data) {
        const mapped = data.map((r, i) => ({
          name: `طالب ${i + 1}`,
          score: parseFloat(r.score),
          date: new Date(r.submitted_at).toLocaleString(),
        }));
        setResults(mapped);
      }

      setLoading(false);
    };

    fetchData();
  }, [quizId]);
  const exportCSV = () => {
    if (!results || results.length === 0) {
      alert("لا توجد بيانات للتصدير.");
      return;
    }

    const headers = ['اسم الطالب', 'الدرجة', 'التاريخ'];
    const rows = results.map((r) => [
      r.users?.name || 'طالب غير معروف',
      `${r.score}%`,
      new Date(r.submitted_at).toLocaleString(),
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `نتائج_${quizTitle || 'اختبار'}.csv`);
  };
  return (
    <div className="min-h-screen bg-navy text-white p-6 font-noto">
      <h1 className="text-2xl font-bold text-orange mb-4 text-center">نتائج: {quizTitle}</h1>

      {loading ? (
        <p className="text-center text-gray-300">جارٍ تحميل النتائج...</p>

      ) : results.length === 0 ? (
        <p className="text-center text-gray-300">لا توجد نتائج بعد لهذا الاختبار.</p>
      ) : (
        <>
          <button
            onClick={exportCSV}
            className="bg-orange text-white m-2 px-4 py-2 rounded hover:bg-orange-600 transition mb-6"
          >
            📥 تصدير النتائج (CSV)
          </button>
          <div className="bg-white text-black p-4 rounded shadow mb-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={results}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <ul className="space-y-4">
            {results.map((r, i) => (
              <li key={i} className="bg-white text-black p-4 rounded shadow">
                <p className="font-bold">{r.name}</p>
                <p>الدرجة: <span className="text-green-600 font-bold">{r.score}%</span></p>
                <p className="text-sm text-gray-600">بتاريخ: {r.date}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
