// src/components/courses/ContentForm.jsx

import { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';

export default function ContentForm({ courseId, onAdded }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('video');
  const [file, setFile] = useState(null);
  const [externalUrl, setExternalUrl] = useState('');
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [creatingSection, setCreatingSection] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // جلب الأقسام عند التحميل
  useEffect(() => {
    supabase
      .from('sections')
      .select('section_id, title')
      .eq('course_id', courseId)
      .order('order_number', { ascending: true })
      .then(({ data }) => {
        setSections(data || []);
        if (data?.length) setSelectedSection(data[0].section_id);
      });
  }, [courseId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('يرجى إدخال عنوان الوحدة');
      return;
    }
    setLoading(true);

    let sectionId = selectedSection;

    // إنشاء قسم جديد إذا لزم
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

    let url = externalUrl;

    // رفع الملف إن لم يكن رابطاً
    if (type !== 'link') {
      if (!file) {
        setError('يرجى اختيار ملف');
        setLoading(false);
        return;
      }
      const ext = file.name.split('.').pop();
      const filePath = `${courseId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase
        .storage.from('course-content')
        .upload(filePath, file);
      if (upErr) {
        setError(upErr.message);
        setLoading(false);
        return;
      }
      const { data: urlData } = supabase
        .storage.from('course-content')
        .getPublicUrl(filePath);
      url = urlData.publicUrl;
    } else {
      // رابط خارجي
      if (!externalUrl.trim()) {
        setError('يرجى إدخال رابط صالح');
        setLoading(false);
        return;
      }
    }

    // إدراج المحتوى مع العنوان
    const { error: insErr } = await supabase
      .from('contents')
      .insert({
        course_id: courseId,
        section_id: sectionId,
        title,            // الحقل الجديد
        type,
        url,
      });
    if (insErr) {
      setError(insErr.message);
    } else {
      // إعادة تهيئة الحقول
      setTitle('');
      setFile(null);
      setExternalUrl('');
      setNewSectionTitle('');
      setCreatingSection(false);
      onAdded?.();
    }

    setLoading(false);
  };

  // أنواع الملفات المقبولة
  const acceptMap = {
    video: 'video/*',
    document: '.pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    image: 'image/*',
    audio: 'audio/*',
    link: undefined,
  };

  return (
    <form onSubmit={handleUpload} className="bg-white text-black p-4 rounded-lg shadow mb-6 font-noto space-y-4">
      <h3 className="text-lg font-bold text-navy">إضافة محتوى جديد</h3>

      {/* حقل العنوان */}
      <div>
        <label className="block mb-1">عنوان الوحدة:</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="أدخل عنوان الوحدة"
          className="w-full border rounded px-4 py-2"
        />
      </div>

      {/* اختيار/إنشاء القسم */}
      <div>
        <label className="block mb-1">القسم:</label>
        {!creatingSection ? (
          <div className="flex gap-2">
            <select
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
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
          <div className="flex gap-2  min-w-0">
            <input
              type="text"
              value={newSectionTitle}
              onChange={e => setNewSectionTitle(e.target.value)}
              placeholder="عنوان القسم الجديد"
              className="flex-grow border  min-w-0 rounded px-4 py-2"
            />
            <button
              type="button"
              onClick={() => { setCreatingSection(false); setNewSectionTitle(''); }}
              className="bg-red-200 px-3 rounded hover:bg-red-300"
            >✖️</button>
          </div>
        )}
      </div>

      {/* اختيار نوع المحتوى */}
      <div>
        <label className="block mb-1">نوع المحتوى:</label>
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="w-full border rounded px-4 py-2"
        >
          <option value="video">📹 فيديو</option>
          <option value="document">📄 مستند</option>
          <option value="image">🖼 صورة</option>
          <option value="audio">🎵 صوت</option>
          <option value="link">🔗 رابط خارجي</option>
        </select>
      </div>

      {/* حقل الملف أو الرابط */}
      {type === 'link' ? (
        <div>
          <label className="block mb-1">الرابط:</label>
          <input
            type="url"
            value={externalUrl}
            onChange={e => setExternalUrl(e.target.value)}
            placeholder="https://..."
            className="w-full border rounded px-4 py-2"
          />
        </div>
      ) : (
        <div>
          <label className="block mb-1">اختر ملف:</label>
          <input
            type="file"
            accept={acceptMap[type]}
            onChange={e => setFile(e.target.files[0])}
            className="w-full border rounded px-4 py-2"
          />
        </div>
      )}

      {/* عرض الخطأ */}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {/* زر الإضافة */}
      <button
        type="submit"
        disabled={loading}
        className="bg-orange text-white w-full py-2 rounded hover:bg-orange-600 transition"
      >
        {loading ? 'جاري الإضافة...' : 'إضافة المحتوى'}
      </button>
    </form>
  );
}
