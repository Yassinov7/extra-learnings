// src/components/EditCourseForm.jsx
import { useState } from 'react';
import { supabase } from '../../api/supabase';
import toast from 'react-hot-toast';

export default function EditCourseForm({ course, onClose, onSaved }) {
    const [title, setTitle] = useState(course.title);
    const [description, setDescription] = useState(course.description || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase
            .from('courses')
            .update({ title, description })
            .eq('course_id', course.course_id);

        if (error) {
            toast.error('فشل التعديل: ' + error.message);
        } else {
            toast.success('✅ تم تعديل الدورة');
            onSaved();
            onClose();
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-navy border-2 p-6 rounded-lg shadow-md w-full max-w-md text-right">
            <h1 className='text-2xl my-3 font-bold mb-4 text-orange hover:text-orange-700'> تعديل معلومات الدورة </h1>
            <label className="block mb-1 text-sm">عنوان الدورة</label>
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border px-3 py-2 rounded mb-2"
            />

            <label className="block mb-1 text-sm">الوصف</label>
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border px-3 py-2 rounded mb-2"
            />

            <div className="flex justify-between">
                <button
                    type="button"
                    onClick={onClose}
                    className="text-white bg-red-600 px-4 py-2 rounded hover:bg-red-800"
                >
                    إلغاء
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-orange text-white px-4 py-2 rounded hover:bg-orange-600"
                >
                    {loading ? '...جارٍ الحفظ' : 'حفظ'}
                </button>
            </div>
        </form>
    );
}
