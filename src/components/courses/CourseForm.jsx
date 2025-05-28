// src/components/courses/CourseForm.jsx
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { supabase } from '../../api/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import useCategories from '../../hooks/useCategories';
import toast from 'react-hot-toast';

const schema = yup.object({
  title: yup.string().required('العنوان مطلوب'),
  description: yup.string().required('الوصف مطلوب'),
  category_id: yup.string().required('التصنيف مطلوب'),
});

export default function CourseForm({ onCreated }) {
  const { user } = useAuth();
  const {
    categories,
    loading: catsLoading,
    addCategory,
    refetch,
  } = useCategories();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      category_id: '',
    },
  });

  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const fileInputRef = useRef(null);

  const [error, setError] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    if (categories.length > 0) {
      setValue('category_id', String(categories[0].id));
    }
  }, [categories, setValue]);

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('اسم التصنيف مطلوب');
      return;
    }

    if (!user || !user.id) {
      toast.error('يجب تسجيل الدخول لإضافة تصنيف');
      return;
    }

    try {
      const newCat = await addCategory({
        name: newCategoryName,
        created_by: user.id,
      });

      if (newCat) {
        toast.success('✅ تم إضافة التصنيف');
        setValue('category_id', String(newCat.id));
        setNewCategoryName('');
        setShowAddCategory(false);
      }
    } catch (error) {
      toast.error('فشل في إضافة التصنيف: ' + error.message);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    const coursePayload = {
      title: data.title,
      description: data.description,
      category_id: Number(data.category_id),
      created_by: user.id,
    };

    // 1. إنشاء الدورة
    const { data: insertedData, error: insertError } = await supabase
      .from('courses')
      .insert(coursePayload)
      .select()
      .single();

    if (insertError || !insertedData) {
      setError(insertError?.message || 'فشل في إنشاء الدورة');
      toast.error('❌ فشل في إنشاء الدورة');
      setLoading(false);
      return;
    }

    let cover_url = null;

    // 2. رفع صورة الغلاف إن وجدت
    if (coverFile) {
      try {
        setUploadingCover(true);

        const ext = coverFile.name.split('.').pop();
        const fileName = `cover_${insertedData.course_id}.${ext}`;
        const filePath = `cover_image/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('course-content')
          .upload(filePath, coverFile, {
            upsert: true,
            contentType: coverFile.type,
          });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from('course-content').getPublicUrl(filePath);

        cover_url = publicUrl;

        // تحديث الدورة ب cover_url
        const { error: updateError } = await supabase
          .from('courses')
          .update({ cover_url })
          .eq('course_id', insertedData.course_id);

        if (updateError) {
          toast.error('فشل في تحديث الغلاف: ' + updateError.message);
        } else {
          toast.success('✅ تم رفع الغلاف');
        }
      } catch (error) {
        toast.error('❌ فشل في رفع الغلاف: ' + error.message);
      } finally {
        setUploadingCover(false);
      }
    }

    toast.success('✅ تم إنشاء الدورة');
    onCreated?.();
    reset();
    setCoverFile(null);
    setCoverPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 font-noto text-right bg-white text-black p-6 rounded-xl shadow-lg max-w-lg mx-auto"
    >
      <h2 className="text-2xl font-bold text-navy mb-4">إنشاء دورة جديدة</h2>

      <div>
        <label>العنوان</label>
        <input
          type="text"
          className="w-full border rounded px-4 py-2 focus:ring-orange-500 focus:outline-none"
          {...register('title')}
        />
        {errors.title && (
          <p className="text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label>الوصف</label>
        <textarea
          rows="3"
          className="w-full border rounded px-4 py-2 focus:ring-orange-500 focus:outline-none"
          {...register('description')}
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className="flex justify-between items-center">
          <span>التصنيف</span>
          <button
            type="button"
            onClick={() => setShowAddCategory(!showAddCategory)}
            className="text-sm text-orange underline"
          >
            {showAddCategory ? 'إلغاء' : 'إضافة تصنيف'}
          </button>
        </label>

        {showAddCategory && (
          <div className="mb-2 flex gap-2 mt-2">
            <input
              type="text"
              placeholder="اسم التصنيف"
              className="flex-1 border rounded px-3 py-2"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="bg-navy text-white px-4 py-2 rounded hover:bg-navy/80"
            >
              إضافة
            </button>
          </div>
        )}

        <select
          {...register('category_id')}
          disabled={catsLoading}
          className="w-full border rounded px-4 py-2 focus:ring-orange-500 focus:outline-none"
        >
          <option value="">اختر تصنيفًا</option>
          {categories.map((cat) => (
            <option key={cat.id} value={String(cat.id)}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.category_id && (
          <p className="text-sm text-red-600">{errors.category_id.message}</p>
        )}
      </div>

      {/* رفع صورة الغلاف */}
      <div>
        <label>صورة الغلاف (اختياري)</label>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleCoverChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-navy file:text-white
            hover:file:bg-navy/80"
        />
        {coverPreview && (
          <img
            src={coverPreview}
            alt="معاينة الغلاف"
            className="mt-3 rounded-lg w-full max-h-64 object-cover border"
          />
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading && (
        <p className="text-sm text-gray-600">
          {uploadingCover ? 'جارٍ رفع الغلاف...' : 'جارٍ إنشاء الدورة...'}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-orange text-white px-4 py-2 rounded hover:bg-orange-600 transition w-full"
      >
        {loading ? 'جارٍ المعالجة...' : 'إنشاء الدورة'}
      </button>
    </form>
  );
}
