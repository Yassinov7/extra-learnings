import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { supabase } from '../../api/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

const schema = yup.object({
  title: yup.string().required('العنوان مطلوب'),
  description: yup.string().required('الوصف مطلوب'),
});

export default function CourseForm({ onCreated }) {
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    const { error: insertError } = await supabase
      .from('courses')
      .insert({
        title: data.title,
        description: data.description,
        created_by: user.id,
      });

    if (insertError) setError(insertError.message);
    else onCreated?.(); // تحديث القائمة مثلاً

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-noto text-right bg-white text-black p-6 rounded-xl shadow-lg max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-navy mb-4">إنشاء دورة جديدة</h2>

      <div>
        <label>العنوان</label>
        <input
          type="text"
          className="w-full border rounded px-4 py-2 focus:ring-orange-500 focus:outline-none"
          {...register('title')}
        />
        {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <label>الوصف</label>
        <textarea
          rows="3"
          className="w-full border rounded px-4 py-2 focus:ring-orange-500 focus:outline-none"
          {...register('description')}
        />
        {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-orange text-white px-4 py-2 rounded hover:bg-orange-600 transition w-full"
      >
        {loading ? 'جارٍ الإضافة...' : 'إنشاء الدورة'}
      </button>
    </form>
  );
}
