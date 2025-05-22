import { useForm } from 'react-hook-form';
import { supabase } from '../../api/supabase';
import { useState, useEffect } from 'react';

export default function QuestionForm({ quizId, onAdded }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    const options = {
      A: data.optionA,
      B: data.optionB,
      C: data.optionC,
      D: data.optionD,
    };

    const { error: insertError } = await supabase.from('questions').insert({
      quiz_id: quizId,
      text: data.text,
      options,
      correct_answer: data.correct_answer,
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      reset();
      onAdded?.(); // إعادة تحميل القائمة
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white text-black p-4 rounded-lg shadow mb-6 space-y-4 font-noto">
      <h3 className="text-lg font-bold text-navy">إضافة سؤال للاختبار</h3>

      <div>
        <label className="block text-sm mb-1">نص السؤال</label>
        <textarea
          {...register('text', { required: 'مطلوب' })}
          rows={3}
          className="w-full border rounded px-4 py-2"
        />
        {errors.text && <p className="text-red-600 text-sm">{errors.text.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">الخيار A</label>
          <input
            {...register('optionA', { required: 'مطلوب' })}
            className="w-full border rounded px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">الخيار B</label>
          <input
            {...register('optionB', { required: 'مطلوب' })}
            className="w-full border rounded px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">الخيار C</label>
          <input
            {...register('optionC', { required: 'مطلوب' })}
            className="w-full border rounded px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">الخيار D</label>
          <input
            {...register('optionD', { required: 'مطلوب' })}
            className="w-full border rounded px-4 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">الإجابة الصحيحة</label>
        <select
          {...register('correct_answer', { required: 'اختر الإجابة الصحيحة' })}
          className="w-full border rounded px-4 py-2"
        >
          <option value="">اختر الإجابة</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>
        {errors.correct_answer && <p className="text-red-600 text-sm">{errors.correct_answer.message}</p>}
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-orange text-white w-full py-2 rounded hover:bg-orange-600 transition"
      >
        {loading ? 'جاري الإضافة...' : 'إضافة السؤال'}
      </button>
    </form>
  );
}
