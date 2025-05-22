import { useForm } from 'react-hook-form';
import { supabase } from '../../api/supabase';
import { useState } from 'react';

export default function QuizForm({ courseId, onAdded }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async ({ title }) => {
    setLoading(true);
    setError('');

    const { error: insertError } = await supabase.from('quizzes').insert({
      course_id: courseId,
      title,
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      reset();
      onAdded?.(); // إعادة التحديث
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white text-black p-4 rounded-lg shadow mb-6 font-noto">
      <h3 className="text-lg font-bold text-navy mb-2">إنشاء اختبار جديد</h3>
      
      <input
        type="text"
        {...register('title', { required: 'عنوان الاختبار مطلوب' })}
        placeholder="عنوان الاختبار"
        className="w-full border rounded px-4 py-2 mb-2"
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
