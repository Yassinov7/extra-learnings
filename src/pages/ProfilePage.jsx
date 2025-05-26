import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../api/supabase';
import { Camera } from 'lucide-react';

export default function ProfilePage() {
  const { user, userData, setUserData } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    avatar_url: '',
  });

  const [uploading, setUploading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef();

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name,
        email: userData.email,
        password: '',
        avatar_url: userData.avatar_url || '',
      });
    }
  }, [userData]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = async (file) => {
    const fileExt = file.name.split('.').pop();
    const filePath = `avatars/${user.id}.${fileExt}`;

    setUploading(true);

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert('فشل رفع الصورة');
      console.error(uploadError);
      return;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const avatar_url = data.publicUrl;
    setFormData(prev => ({ ...prev, avatar_url }));
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    // تحديث البيانات في جدول user_profiles
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        name: formData.name,
        avatar_url: formData.avatar_url,
      })
      .eq('user_id', user.id);

    if (updateError) {
      alert('فشل تحديث البيانات');
      console.error(updateError);
      setSaving(false);
      return;
    }

    // تحديث البريد الإلكتروني
    if (formData.email !== user.email) {
      const { error: emailError } = await supabase.auth.updateUser({
        email: formData.email,
      });
      if (emailError) {
        alert('فشل تحديث البريد الإلكتروني');
        console.error(emailError);
      }
    }

    // تحديث كلمة السر
    if (formData.password.trim()) {
      const { error: passError } = await supabase.auth.updateUser({
        password: formData.password,
      });
      if (passError) {
        alert('فشل تحديث كلمة السر');
        console.error(passError);
      }
    }

    setUserData(prev => ({
      ...prev,
      name: formData.name,
      avatar_url: formData.avatar_url,
    }));

    setSaving(false);
    setShowConfirm(false);
    setSuccessMsg('تم حفظ التغييرات بنجاح ✅');

    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="min-h-screen bg-navy text-white font-noto p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🧑‍💻 الملف الشخصي</h1>

      {/* صورة الحساب */}
      <div className="relative inline-block mb-6">
        <img
          src={
            formData.avatar_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=0D8ABC&color=fff`
          }
          alt="avatar"
          className="w-20 h-20 rounded-full border-2 border-white shadow"
        />
        <button
          onClick={() => fileInputRef.current.click()}
          className="absolute bottom-0 right-0 bg-orange p-1 rounded-full text-white"
          title="تغيير الصورة"
        >
          <Camera size={16} />
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])}
          className="hidden"
        />
        {uploading && <p className="text-xs text-orange mt-2">جاري رفع الصورة...</p>}
      </div>

      {/* النموذج */}
      <div className="space-y-4">
        <div>
          <label className="block mb-1 text-sm">الاسم</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-white text-navy"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">البريد الإلكتروني</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-white text-navy"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">كلمة المرور الجديدة</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="اتركه فارغًا إذا لا تريد تغييره"
            className="w-full px-4 py-2 rounded bg-white text-navy"
          />
        </div>

        {/* زر الحفظ */}
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full bg-orange py-2 rounded hover:bg-orange-600 transition text-white font-bold mt-4"
        >
          حفظ التغييرات
        </button>

        {/* رسالة النجاح */}
        {successMsg && (
          <div className="bg-green-500 text-white mt-4 py-2 px-4 rounded text-center">
            {successMsg}
          </div>
        )}
      </div>

      {/* نافذة التأكيد */}
      {showConfirm && (
        <div className="fixed inset-0 bg-[0,0,0,0.4]  flex items-center justify-center z-50">
          <div className="bg-white text-navy p-6 rounded shadow-md w-80">
            <h2 className="text-lg font-bold mb-4">تأكيد الحفظ</h2>
            <p className="mb-4">هل أنت متأكد أنك تريد حفظ التغييرات؟</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400"
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-1 bg-orange text-white rounded hover:bg-orange-600"
              >
                نعم، احفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
