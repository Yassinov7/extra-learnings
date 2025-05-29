// src/pages/ProfilePage.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../api/supabase';
import { Camera, Eye, EyeOff } from 'lucide-react';


export default function ProfilePage() {
  const { user, userData, setUserData } = useAuth();
  const fileRef = useRef();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    username: '',
    oldPassword: '',
    newPassword: '',
    avatar_url: '',
  });
  const [uploading, setUploading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  // جلب البيانات
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      const initial = profile || {};
      setForm({
        name: initial.name || user.email.split('@')[0],
        email: initial.email || user.email,
        username: initial.username || user.email.split('@')[0],
        oldPassword: '',
        newPassword: '',
        avatar_url: initial.avatar_url || '',
      });
    })();
  }, [user]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  const handleImageUpload = async (file) => {
    if (!file?.type.startsWith('image/')) {
      return showToast('اختر صورة صالحة فقط', 'warning');
    }
    const ext = file.name.split('.').pop();
    const path = `${user.id}.${ext}`;
    setUploading(true);

    const { error: upErr } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });
    if (upErr) {
      setUploading(false);
      return showToast('فشل رفع الصورة', 'error');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(path);
    setUploading(false);

    if (!publicUrl) {
      return showToast('تعذّر الحصول على رابط الصورة', 'error');
    }

    const { error: dbErr } = await supabase
      .from('user_profiles')
      .update({ avatar_url: publicUrl })
      .eq('user_id', user.id);
    if (dbErr) {
      return showToast('فشل تحديث الصورة في الملف الشخصي', 'error');
    }

    setForm(f => ({ ...f, avatar_url: publicUrl }));
    showToast('تم تحديث الصورة', 'success');
  };

  const handleSave = async () => {
    if (form.newPassword && !form.oldPassword) {
      return showToast('أدخل كلمة المرور القديمة أولاً', 'warning');
    }
    setSaving(true);


    // تحديث البيانات
    await supabase
      .from('user_profiles')
      .update({
        name: form.name,
        username: form.username,
        avatar_url: form.avatar_url,
      })
      .eq('user_id', user.id);

    // تغيير كلمة المرور إذا وُجدت
    if (form.newPassword) {
      const { error: authErr } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.oldPassword,
      });
      if (authErr) {
        setSaving(false);
        return showToast('كلمة المرور القديمة غير صحيحة', 'error');
      }
      await supabase.auth.updateUser({ password: form.newPassword });
    }

    // جلب التحديث
    const { data: updated } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    setUserData(prev => ({ ...prev, ...updated }));

    setSaving(false);
    setShowConfirm(false);
    showToast('تم حفظ التغييرات', 'success');
    
  };

  return (
    <div className="min-h-screen bg-navy/5 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-300 p-6 text-center">
          <h1 className="text-orange text-2xl font-bold">ملفي الشخصي</h1>
        </div>

        <div className="p-6 space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={form.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name)}&background=0D8ABC&color=fff`}
                alt="avatar"
                className="w-24 h-24 rounded-full border-4 border-orange object-cover"
              />
              <button
                onClick={() => fileRef.current.click()}
                className="absolute bottom-0 right-0 bg-orange p-2 rounded-full text-white hover:bg-orange-dark transition"
              >
                <Camera size={18} />
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => handleImageUpload(e.target.files[0])}
            />
            {uploading && <p className="mt-2 text-sm text-orange">جاري رفع الصورة…</p>}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {[
              { label: 'الاسم', key: 'name', type: 'text', placeholder: 'أدخل اسمك' },
              { label: 'اسم المستخدم', key: 'username', type: 'text', placeholder: 'أدخل اسم المستخدم' },
              { label: 'البريد الإلكتروني', key: 'email', type: 'email', placeholder: 'أدخل بريدك' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-navy mb-1">{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 text-black rounded focus:outline-none focus:ring focus:ring-orange"
                />
              </div>
            ))}

            {/* Password Change Trigger */}
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full text-center text-orange underline"
            >
              تغيير كلمة المرور
            </button>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-orange text-white py-3 rounded-lg hover:bg-orange-dark transition disabled:opacity-50"
          >
            {saving ? 'جاري الحفظ…' : '💾 حفظ التغييرات'}
          </button>
        </div>
      </div>

      {/* Confirm Password Change Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-80 p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">تغيير كلمة المرور</h2>

            <div className="space-y-4 relative">

              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="كلمة المرور القديمة"
                value={form.oldPassword}
                onChange={e => setForm(f => ({ ...f, oldPassword: e.target.value }))}
                className="w-full px-4 py-2 border rounded text-gray-800 focus:ring focus:ring-orange"
              />

              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="كلمة المرور الجديدة"
                value={form.newPassword}
                onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
                className="w-full px-4 py-2 border rounded text-gray-800 focus:ring focus:ring-orange"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/8  left-3 transform -translate-y-1/2 text-gray-500 hover:text-orange-500"
                tabIndex={-1}
                aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>

              <div className="flex justify-evenly space-x-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 border text-white rounded bg-red-500 hover:bg-red-700 transition"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-orange text-white rounded hover:bg-orange-600 transition"
                >
                  تأكيد
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.message && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-2 rounded shadow-lg text-white ${toast.type === 'success'
            ? 'bg-green-500'
            : toast.type === 'error'
              ? 'bg-red-500'
              : toast.type === 'warning'
                ? 'bg-yellow-500'
                : 'bg-navy-600'
            }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
