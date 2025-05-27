// src/components/quizzes/QuizForm.jsx

import { useForm } from 'react-hook-form';
import { supabase } from '../../api/supabase';
import { useState, useEffect } from 'react';

export default function QuizForm({ courseId, onAdded }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [creatingSection, setCreatingSection] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // جلب الأقسام
  useEffect(() => {
    const fetchSections = async () => {
      const { data } = await supabase
        .from('sections')
        .select('section_id, title')
        .eq('course_id', courseId)
        .order('order_number', { ascending: true });
      setSections(data || []);
      if (data?.length) setSelectedSection(data[0].section_id);
    };
    fetchSections();
  }, [courseId]);

  const onSubmit = async ({ title }) => {
    setError('');
    setLoading(true);

    let sectionId = selectedSection;

    if (creatingSection && newSectionTitle.trim()) {
      const { data, error: secErr } = await supabase
        .from('sections')
        .insert({ course_id: courseId, title: newSectionTitle })
        .single();
      if (secErr) {
        setError('خطأ في إنشاء القسم: ' + secErr.message);
        setLoading(false);
        return;
      }
      sectionId = data.section_id;
    }

    const { error: insertError } = await supabase.from('quizzes').insert({
      course_id: courseId,
      section_id: sectionId,
      title,
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      reset();
      setCreatingSection(false);
      setNewSectionTitle('');
      onAdded?.();
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white text-black p-4 rounded-lg shadow mb-6 font-noto space-y-4">
      <h3 className="text-lg font-bold text-navy mb-2">إنشاء اختبار جديد</h3>

      {/* اختيار/إنشاء قسم */}
      <div>
        <label className="block mb-1"> القسم:</label>
        {!creatingSection ? (
          <div className="flex gap-2 mb-2">
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="flex-grow border rounded px-4 py-2"
            >
              {sections.map(s => (
                <option key={s.section_id} value={s.section_id}>{s.title}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setCreatingSection(true)}
              className="bg-gray-200 px-3 rounded hover:bg-gray-300"
            >➕ جديد</button>
          </div>
        ) : (
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              placeholder="عنوان القسم الجديد"
              className="flex-grow border rounded px-4 py-2"
            />
            <button
              type="button"
              onClick={() => { setCreatingSection(false); setNewSectionTitle(''); }}
              className="bg-red-200 px-3 rounded hover:bg-red-300"
            >✖️</button>
          </div>
        )}
      </div>

      {/* حقل العنوان */}
      <label className="block mb-1">عنوان الاختبار:</label>
      <input
        type="text"
        {...register('title', { required: 'عنوان الاختبار مطلوب' })}
        placeholder="أدخل عنوان الاختبار"
        className="w-full border rounded px-4 py-2"
      />
      {errors.title && <p className="text-red-600 text-sm">{errors.title.message}</p>}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-orange text-white w-full py-2 rounded hover:bg-orange-600 transition"
      >
        {loading ? 'جارٍ الإنشاء...' : 'إنشاء'}
      </button>
    </form>
  );
}
