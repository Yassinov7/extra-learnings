import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import useCategories from '../hooks/useCategories';
import CategoryForm from '../components/categories/CategoryForm';
import toast from 'react-hot-toast';

export default function CategoriesPage() {
  const { userData, user } = useAuth();
  const { categories, loading, error, addCategory, updateCategory, deleteCategory } = useCategories();

  const [editingCategory, setEditingCategory] = useState(null);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  if (userData?.role !== 'teacher') {
    return <p className="text-center mt-20 text-red-600">ليس لديك صلاحية الوصول لهذه الصفحة.</p>;
  }

  const handleCreate = async (data) => {
    setFormLoading(true);
    setFormError('');
    try {
      await addCategory({ ...data, created_by: user.id });
      toast.success('✅ تم إضافة التصنيف');
    } catch (e) {
      setFormError(e.message);
    }
    setFormLoading(false);
  };

  const handleUpdate = async (id, data) => {
    setFormLoading(true);
    setFormError('');
    try {
      await updateCategory(id, data);
      toast.success('✅ تم تحديث التصنيف');
      setEditingCategory(null);
    } catch (e) {
      setFormError(e.message);
    }
    setFormLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id);
      toast.success('✅ تم حذف التصنيف');
    } catch (e) {
      toast.error('❌ حدث خطأ أثناء الحذف');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-noto text-right">
      <h1 className="text-3xl font-bold mb-6 text-navy">إدارة التصنيفات</h1>

      <div className="mb-6 p-4 border rounded shadow bg-white text-black">
        <h2 className="text-2xl mb-4">{editingCategory ? 'تعديل تصنيف' : 'إضافة تصنيف جديد'}</h2>
        <CategoryForm
          key={editingCategory ? editingCategory.id : 'new'}
          onCreated={(data) =>
            editingCategory
              ? handleUpdate(editingCategory.id, data)
              : handleCreate(data)
          }
          initialData={editingCategory || {}}
          loading={formLoading}
          error={formError}
        />
        {editingCategory && (
          <button
            className="mt-2 text-sm text-red-600 hover:underline"
            onClick={() => setEditingCategory(null)}
          >
            إلغاء التعديل
          </button>
        )}
      </div>

      {loading && <p>جارٍ تحميل التصنيفات...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <ul className="space-y-4">
        {categories.map((cat) => (
          <li
            key={cat.id}
            className="flex justify-between items-center border p-4 rounded bg-white text-black"
          >
            <div>
              <h3 className="text-xl font-semibold">{cat.name}</h3>
              {cat.description && (
                <p className="text-gray-700">{cat.description}</p>
              )}
            </div>
            <div className="space-x-2">
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => setEditingCategory(cat)}
              >
                تعديل
              </button>
              <button
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={() => handleDelete(cat.id)}
              >
                حذف
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
