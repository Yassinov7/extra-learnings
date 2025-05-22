import { useForm } from 'react-hook-form';
import { supabase } from '../../api/supabase';
import { useState } from 'react';

export default function ContentForm({ courseId, onAdded }) {
  const [type, setType] = useState('video'); // أو 'document'
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!file) {
      setError('يرجى اختيار ملف');
      setLoading(false);
      return;
    }

    const fileExt = file.name.split('.').pop();
    const filePath = `${courseId}/${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('course-content')
      .upload(filePath, file);

    if (uploadError) {
      setError(uploadError.message);
      setLoading(false);
      return;
    }

    const { data: urlData } = supabase
      .storage
      .from('course-content')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    const { error: insertError } = await supabase.from('contents').insert({
      course_id: courseId,
      type,
      url: publicUrl,
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      setFile(null);
      onAdded?.();
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleUpload} className="bg-white text-black p-4 rounded-lg shadow mb-4 font-noto space-y-4">
      <h3 className="text-lg font-bold text-navy">إضافة محتوى جديد</h3>

      <div>
        <label>نوع المحتوى:</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border rounded px-4 py-2"
        >
          <option value="video">📹 فيديو</option>
          <option value="document">📄 مستند</option>
        </select>
      </div>

      <div>
        <label>الملف:</label>
        <input
          type="file"
          accept={type === 'video' ? 'video/*' : 'application/pdf,application/msword'}
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full border rounded px-4 py-2"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-orange text-white w-full py-2 rounded hover:bg-orange-600 transition"
      >
        {loading ? 'جاري الرفع...' : 'رفع المحتوى'}
      </button>
    </form>
  );
}
