import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';
import { useAuth } from '../contexts/AuthContext';
import ContentForm from '../components/courses/ContentForm';
import useProgress from '../hooks/useProgress';
import QuizForm from '../components/quizzes/QuizForm';

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user, userData } = useAuth();

  const [course, setCourse] = useState(null);
  const [contents, setContents] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  useProgress(user?.id, course?.course_id); // Triggers progress calculation

  // Fetch course data
  useEffect(() => {
    const fetchData = async () => {
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('course_id', id)
        .single();

      setCourse(courseData);

      const { data: contentData } = await supabase
        .from('contents')
        .select('*')
        .eq('course_id', id);
      setContents(contentData || []);

      const { data: quizData } = await supabase
        .from('quizzes')
        .select('*')
        .eq('course_id', id);
      setQuizzes(quizData || []);

      setLoading(false);
    };

    fetchData();
  }, [id]);

  // Check enrollment
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!user || !id) return;

      const { data } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', id)
        .maybeSingle();

      if (data) setEnrolled(true);
    };

    checkEnrollment();
  }, [user, id]);

  // Fetch progress
  useEffect(() => {
    const fetchProgress = async () => {
      const { data } = await supabase
        .from('progress')
        .select('percent_complete')
        .eq('user_id', user?.id)
        .eq('course_id', id)
        .maybeSingle();

      if (data) setProgressPercent(data.percent_complete);
    };

    if (enrolled) fetchProgress();
  }, [enrolled, user, id]);

  // Log content view
  const logView = async (contentId) => {
    if (!user) return;
    await supabase.from('content_views').upsert({
      user_id: user.id,
      course_id: id,
      content_id: contentId,
    }, { onConflict: ['user_id', 'content_id'] });
  };

  const handleEnroll = async () => {
    const { error } = await supabase.from('enrollments').insert({
      user_id: user.id,
      course_id: id,
    });

    if (!error) setEnrolled(true);
    else alert('حدث خطأ أثناء الانضمام: ' + error.message);
  };

  if (loading || !course) {
    return (
      <div className="min-h-screen bg-navy text-white flex justify-center items-center">
        <p className="text-lg font-noto">جارٍ تحميل الدورة...</p>
      </div>
    );
  }

  return (
    <>
      {/* Progress bar */}
      {userData?.role === 'student' && (
        <div className="mb-4 px-6">
          <label className="block mb-1">نسبة التقدّم:</label>
          <div className="w-full bg-gray-300 rounded h-4 overflow-hidden">
            <div
              className="bg-orange h-4 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <p className="text-sm mt-1 text-white">{progressPercent.toFixed(2)}%</p>
        </div>
      )}

      <div className="min-h-screen bg-navy text-white p-6 font-noto">
        <h1 className="text-2xl font-bold text-orange mb-2">{course.title}</h1>
        <p className="mb-4">{course.description}</p>

        {/* Enroll button */}
        {userData?.role === 'student' && !enrolled && (
          <button
            onClick={handleEnroll}
            className="bg-orange text-white px-4 py-2 rounded hover:bg-orange-600 transition mb-4"
          >
            انضمام للدورة
          </button>
        )}

        {/* Teacher tools */}
        {userData?.role === 'teacher' && user.id === course.created_by && (
          <>
            <ContentForm courseId={id} onAdded={() => window.location.reload()} />
            <QuizForm courseId={id} onAdded={() => window.location.reload()} />
          </>
        )}

        {/* Content */}
        <h2 className="text-xl mt-6 mb-2 text-white border-b border-white pb-1">المحتوى</h2>
        {contents.length === 0 ? (
          <p className="text-gray-300">لا يوجد محتوى بعد.</p>
        ) : (
          <ul className="list-disc pl-6 text-sm">
            {contents.map((item) => (
              <div key={item.content_id} className="mb-6">
                {item.type === 'video' ? (
                  <video
                    controls
                    className="w-full rounded-lg shadow"
                    onPlay={() => logView(item.content_id)}
                  >
                    <source src={item.url} type="video/mp4" />
                    المتصفح لا يدعم تشغيل الفيديو
                  </video>
                ) : (
                  <iframe
                    src={item.url}
                    className="w-full h-96 rounded-lg shadow"
                    onLoad={() => logView(item.content_id)}
                    title="Document Viewer"
                  />
                )}
              </div>
            ))}
          </ul>
        )}

        {/* Quizzes */}
        <h2 className="text-xl mt-6 mb-2 text-white border-b border-white pb-1">الاختبارات</h2>
        {userData?.role === 'teacher' && user.id === course.created_by && (
          <Link
            to={`/courses/${id}/results`}
            className="inline-block mt-4 my-3 bg-orange text-white px-4 py-2 rounded hover:bg-orange-600 transition"
          >
            📊 لوحة نتائج الدورة
          </Link>
        )}
        {quizzes.length === 0 ? (
          <p className="text-gray-300">لا توجد اختبارات بعد.</p>
        ) : (
          <div className="space-y-2">
            {quizzes.map((quiz) => (
              <Link
                key={quiz.quiz_id}
                to={`/quizzes/${quiz.quiz_id}`}
                className="block bg-white text-navy px-4 py-2 rounded shadow hover:bg-orange hover:text-white transition"
              >
                📄 {quiz.title}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
