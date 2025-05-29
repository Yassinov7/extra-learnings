// src/pages/CourseDetailPage.jsx

import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';
import { useAuth } from '../contexts/AuthContext';
import ContentForm from '../components/courses/ContentForm';
import QuizForm from '../components/quizzes/QuizForm';
import ContentItem from '../components/courses/ContentItem';
import useProgress from '../hooks/useProgress';

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user, userData } = useAuth();

  const [course, setCourse] = useState(null);
  const [coverUrl, setCoverUrl] = useState('');
  const [sections, setSections] = useState([]);
  const [contents, setContents] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  const [activeSection, setActiveSection] = useState(null);
  const [uploadingCover, setUploadingCover] = useState(false);

  useProgress(user?.id, course?.course_id);

  // جلب البيانات الأساسية
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('course_id', id)
        .single();
      setCourse(courseData);
      setCoverUrl(courseData.cover_url || '/assets/images/react.js.png');

      const { data: secs } = await supabase
        .from('sections')
        .select('*')
        .eq('course_id', id)
        .order('order_number', { ascending: true });
      setSections(secs || []);
      if (secs?.length) setActiveSection(secs[0].section_id);

      const { data: conts } = await supabase
        .from('contents')
        .select('*')
        .eq('course_id', id);
      setContents(conts || []);

      const { data: qs } = await supabase
        .from('quizzes')
        .select('*')
        .eq('course_id', id);
      setQuizzes(qs || []);

      setLoading(false);
    };

    fetchData();
  }, [id]);

  // تحقق التسجيل
  useEffect(() => {
    if (!user) return;
    supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', id)
      .maybeSingle()
      .then(({ data }) => setEnrolled(!!data));
  }, [user, id]);

  // جلب نسبة التقدم
  useEffect(() => {
    if (!enrolled) return;
    supabase
      .from('progress')
      .select('percent_complete')
      .eq('user_id', user.id)
      .eq('course_id', id)
      .maybeSingle()
      .then(({ data }) => data && setProgressPercent(data.percent_complete));
  }, [enrolled, user, id]);

  // تسجيل عرض محتوى
  const logView = async (contentId) => {
    if (!user) return;
    await supabase.from('content_views').upsert({
      user_id: user.id,
      course_id: id,
      content_id,
    }, { onConflict: ['user_id', 'content_id'] });
  };

  // انضمام الطالب
  const handleEnroll = async () => {
    const { error } = await supabase.from('enrollments').insert({
      user_id: user.id,
      course_id: id,
    });
    if (!error) setEnrolled(true);
  };

  // تغيير غلاف الدورة
  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingCover(true);

    try {
      const ext = file.name.split('.').pop();
      const fileName = `cover_${id}.${ext}`;
      const filePath = `cover_image/${fileName}`;

      // رفع الملف
      const { error: uploadError } = await supabase
        .storage
        .from('course-content')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw new Error(uploadError.message);

      // جلب الرابط العام
      const {
        data: { publicUrl },
        error: urlError
      } = supabase
        .storage
        .from('course-content')
        .getPublicUrl(filePath);

      if (urlError) throw new Error(urlError.message);

      // تحديث غلاف الدورة
      const { error: updateError } = await supabase
        .from('courses')
        .update({ cover_url: publicUrl })
        .eq('course_id', id);

      if (updateError) throw new Error(updateError.message);

      // تحديث الحالة لعرض الغلاف الجديد
      setCoverUrl(publicUrl);
    } catch (err) {
      alert('حدث خطأ أثناء رفع الغلاف: ' + err.message);
    } finally {
      setUploadingCover(false);
    }
  };


  if (loading || !course) {
    return (
      <div className="min-h-screen bg-navy text-white flex items-center justify-center">
        <p className="font-noto text-lg">جارٍ التحميل...</p>
      </div>
    );
  }

  const sectionContents = contents.filter(c => c.section_id === activeSection);

  return (
    <div className="min-h-screen bg-navy text-white p-6 font-noto">
      {/* غلاف الدورة */}
      {/* غلاف الدورة مع aspect ratio وتضمين responsive */}
      <div className="aspect-w-16 aspect-h-9 mb-4 rounded-lg shadow-lg overflow-hidden bg-gray-800">
        <picture>
          <source
            media="(min-width:1024px)"
            srcSet={`${coverUrl}?w=1200`}
          />
          <source
            media="(min-width:640px)"
            srcSet={`${coverUrl}?w=800`}
          />
          <img
            src={`${coverUrl}?w=400`}
            alt={`غلاف ${course.title}`}
            className="w-full h-full object-contain"
            loading="lazy"
            onError={e => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/assets/images/react.js.png';
            }}
          />
        </picture>
      </div>

      {/* زر تغيير الغلاف (للمعلم فقط) */}
      {userData?.role === 'teacher' && user.id === course.created_by && (
        <div className="mb-6">
          <label className="inline-block bg-gray-800 text-gray-200 px-4 py-2 rounded cursor-pointer hover:bg-gray-700 transition">
            {uploadingCover ? 'جاري الرفع...' : 'تغيير الغلاف'}
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="hidden"
              disabled={uploadingCover}
            />
          </label>
        </div>
      )}

      {/* عنوان ووصف الدورة */}
      <h1 className="text-3xl font-bold text-orange mb-2">{course.title}</h1>
      <p className="mb-4">{course.description}</p>

      {/* Progress bar */}
      {userData?.role === 'student' && enrolled && (
        <div className="mb-6">
          <label className="block mb-1">نسبة التقدّم:</label>
          <div className="w-full bg-gray-300 rounded h-4 overflow-hidden">
            <div
              className="bg-orange h-4 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-sm mt-1">{progressPercent.toFixed(2)}%</p>
        </div>
      )}

      {/* Enroll button */}
      {userData?.role === 'student' && !enrolled && (
        <button
          onClick={handleEnroll}
          className="bg-orange px-4 py-2 rounded hover:bg-orange-600 transition mb-6"
        >
          انضمام للدورة
        </button>
      )}

      {/* Teacher tools */}
      {userData?.role === 'teacher' && user.id === course.created_by && (
        <div className="space-y-4 mb-6">
          <ContentForm courseId={id} onAdded={() => window.location.reload()} />
          <QuizForm courseId={id} onAdded={() => window.location.reload()} />
        </div>
      )}

      {/* Section Tabs */}
      <div className="overflow-x-auto mb-4">
        <div className="inline-flex space-x-2">
          {sections.map(sec => (
            <button
              key={sec.section_id}
              onClick={() => setActiveSection(sec.section_id)}
              className={`px-4 py-2 rounded-t-lg ${activeSection === sec.section_id
                ? 'bg-white text-navy font-semibold'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
            >
              {sec.title}
            </button>
          ))}
        </div>
      </div>

      {/* TOC */}
      {/* {sectionContents.length > 0 && (
        <nav className="mb-6 bg-gray-800 p-4 rounded">
          <h4 className="text-lg font-semibold mb-2">جدول المحتويات</h4>
          <ul className="space-y-1">
            {sectionContents.map(item => (
              <li key={item.content_id}>
                <a
                  href={`#content-${item.content_id}`}
                  className="text-orange hover:underline"
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )} */}

      {/* Accordion Content */}
      <h4 className="text-lg font-semibold mb-2">المحتوى</h4>
      {sectionContents.length === 0 ? (
        <p className="text-gray-300">لا يوجد محتوى في هذا القسم.</p>
      ) : (
        sectionContents.map(item => (
          <ContentItem key={item.content_id} item={item} onView={logView} />

        ))
      )}

      {/* Quizzes */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-2">الاختبارات</h2>
        {quizzes.filter(q => q.section_id === activeSection).length === 0 ? (
          <p className="text-gray-300">لا توجد اختبارات في هذا القسم.</p>
        ) : (
          quizzes
            .filter(q => q.section_id === activeSection)
            .map(quiz => (
              <Link
                key={quiz.quiz_id}
                to={`/quizzes/${quiz.quiz_id}`}
                className="block bg-white text-navy px-4 py-2 rounded mb-2 shadow hover:bg-orange hover:text-white transition"
              >
                📄 {quiz.title}
              </Link>
            ))
        )}
      </div>
    </div>
  );
}
