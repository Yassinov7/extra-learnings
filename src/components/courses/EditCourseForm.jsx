import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { supabase } from '../../api/supabase';
import toast from 'react-hot-toast';
import useCategories from '../../hooks/useCategories';

const schema = yup.object({
  title: yup.string().required('العنوان مطلوب'),
  description: yup.string().required('الوصف مطلوب'),
  category_id: yup.string().required('التصنيف مطلوب'),
});

export default function EditCourseForm({ course, onClose, onSaved }) {
  const { categories, loading: catsLoading } = useCategories();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: course.title,
      description: course.description || '',
      category_id: '',
    },
  });

  useEffect(() => {
    if (categories.length > 0) {
      reset({
        title: course.title,
        description: course.description || '',
        category_id: String(course.category_id || categories[0].id),
      });
    }
  }, [course, categories, reset]);

  const onSubmit = async (data) => {
    const updates = {
      title: data.title,
      description: data.description,
      category_id: Number(data.category_id),
      // cover_url لا يتم تغييره
    };

    const { error } = await supabase
      .from('courses')
      .update(updates)
      .eq('course_id', course.course_id);

    if (error) {
      toast.error('❌ فشل التعديل: ' + error.message);
    } else {
      toast.success('✅ تم تعديل الدورة');
      onSaved();
      onClose();
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="font-noto text-right bg-white text-navy p-6 rounded-xl shadow-lg max-w-lg mx-auto
                 h-auto flex flex-col space-y-6"
    >
      <h2 className="text-2xl font-bold mb-2 text-center">تعديل معلومات الدورة</h2>

      {/* صورة الغلاف فقط */}
      {course.cover_url && (
        <div className="mx-auto mb-4 w-full max-w-md rounded-lg overflow-hidden shadow-md border border-gray-300">
          <img
            src={
              course.cover_url.startsWith('http') 
                ? course.cover_url 
                : supabase.storage.from('course-content').getPublicUrl(course.cover_url).publicUrl
            }
            alt="صورة الغلاف"
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">عنوان الدورة</label>
          <input
            type="text"
            {...register('title')}
            className={`w-full border rounded px-4 py-2 focus:ring-orange-500 focus:outline-none ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block mb-1 font-semibold">الوصف</label>
          <textarea
            rows="4"
            {...register('description')}
            className={`w-full border rounded px-4 py-2 focus:ring-orange-500 focus:outline-none ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block mb-1 font-semibold">التصنيف</label>
          <select
            {...register('category_id')}
            disabled={catsLoading || isSubmitting}
            className={`w-full border rounded px-4 py-2 focus:ring-orange-500 focus:outline-none ${
              errors.category_id ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">اختر تصنيفًا</option>
            {categories.map((cat) => (
              <option key={cat.id} value={String(cat.id)}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p className="text-sm text-red-600 mt-1">{errors.category_id.message}</p>
          )}
        </div>
      </div>

      {/* أزرار التحكم */}
      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 bg-gray-300 text-navy rounded hover:bg-gray-400 transition"
          disabled={isSubmitting}
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-orange text-white rounded hover:bg-orange-600 transition"
        >
          {isSubmitting ? 'جارٍ الحفظ…' : 'حفظ التعديلات'}
        </button>
      </div>
    </form>
  );
}
