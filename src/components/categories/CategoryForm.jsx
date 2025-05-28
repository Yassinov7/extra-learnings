import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useEffect } from 'react';

const schema = yup.object({
  name: yup.string().required('اسم التصنيف مطلوب'),
  description: yup.string().optional(),
});

export default function CategoryForm({ onCreated, initialData = {}, loading = false, error = '' }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialData,
  });

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const onSubmit = (data) => {
    onCreated(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 font-noto text-right bg-white text-black p-6 rounded-xl shadow-lg max-w-lg mx-auto"
    >
      <div>
        <label>اسم التصنيف</label>
        <input
          type="text"
          {...register('name')}
          className="w-full border rounded px-4 py-2 focus:ring-orange-500 focus:outline-none"
        />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label>الوصف (اختياري)</label>
        <textarea
          rows="3"
          {...register('description')}
          className="w-full border rounded px-4 py-2 focus:ring-orange-500 focus:outline-none"
        />
        {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-orange text-white px-4 py-2 rounded hover:bg-orange-600 transition w-full"
      >
        {loading ? 'جاري الحفظ...' : initialData.id ? 'تحديث التصنيف' : 'إضافة التصنيف'}
      </button>
    </form>
  );
}
