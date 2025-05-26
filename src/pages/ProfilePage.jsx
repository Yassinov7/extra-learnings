// src/pages/ProfilePage.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../api/supabase';
import { Camera } from 'lucide-react';

export default function ProfilePage() {
  const { user, userData, setUserData } = useAuth();
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
  const [toast, setToast] = useState('');
  const fileRef = useRef();

  // 1. جلب البيانات من user_profiles
  const syncUserProfile = async () => {
    if (!user) return;
    const { data: profile, error: pErr } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (pErr) console.error(pErr);
    const initial = profile || {};
    setForm({
      name: initial.name || user.email.split('@')[0],
      email: initial.email || user.email,
      username: initial.username || user.email.split('@')[0],
      oldPassword: '',
      newPassword: '',
      avatar_url: initial.avatar_url || '',
    });
  };

  useEffect(() => { syncUserProfile(); }, [user]);

  // 2. رفع الصورة (تصحيح المسار)
  const handleImageUpload = async (file) => {
    const ext = file.name.split('.').pop();
    const path = `${user.id}.${ext}`; // لا تكرار avatars/
    setUploading(true);
    const { error: upErr } = await supabase.storage
      .from('avatars')      // <-- bucket name
      .upload(path, file, { upsert: true });
    setUploading(false);
    if (upErr) {
      console.error(upErr);
      setToast('❌ فشل رفع الصورة');
      return;
    }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    setForm(f => ({ ...f, avatar_url: data.publicUrl }));
  };

  // 3. حفظ التغييرات مع التحقّق من كلمة المرور القديمة
  const handleSave = async () => {
    // إذا يريد تغيير كلمة المرور، يجب تقديم القديمة
    if (form.newPassword && !form.oldPassword) {
      setToast('⚠️ الرجاء إدخال كلمة المرور القديمة أولاً');
      return;
    }
    setSaving(true);

    // تحديث user_profiles
    await supabase
      .from('user_profiles')
      .update({
        name: form.name,
        username: form.username,
        avatar_url: form.avatar_url,
      })
      .eq('user_id', user.id);

    // تحديث البريد
    if (form.email !== user.email) {
      const { error: eErr } = await supabase.auth.updateUser({ email: form.email });
      if (eErr) console.error(eErr);
    }

    // تغيير كلمة المرور
    if (form.newPassword) {
      // تحقق كلمة المرور القديمة
      const { error: authErr } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.oldPassword,
      });
      if (authErr) {
        setToast('❌ كلمة المرور القديمة غير صحيحة');
      } else {
        const { error: pwErr } = await supabase.auth.updateUser({
          password: form.newPassword,
        });
        if (pwErr) console.error(pwErr);
      }
    }

    // جلب البيانات المحدثة
    const { data: updated } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    setUserData(prev => ({ ...prev, ...updated }));

    setSaving(false);
    setShowConfirm(false);
    setToast('✅ تم حفظ التغييرات بنجاح');
  };

  // 4. عرض الصفحة
  return (
    <div className="min-h-screen bg-navy text-white font-noto p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">🧑‍💻 ملفي الشخصي</h1>

      {/* صورة الحساب */}
      <div className="relative inline-block mb-6">
        <img
          src={
            form.avatar_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name)}&background=0D8ABC&color=fff`
          }
          alt="avatar"
          className="w-24 h-24 rounded-full border-2 border-white shadow"
        />
        <button
          onClick={() => fileRef.current.click()}
          className="absolute bottom-0 right-0 bg-orange p-1 rounded-full text-white"
        >
          <Camera size={16} />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={e => e.target.files[0] && handleImageUpload(e.target.files[0])}
          className="hidden"
        />
        {uploading && <p className="text-xs text-orange mt-2">جاري رفع الصورة…</p>}
      </div>

      {/* نموذج البيانات */}
      <div className="space-y-4">
        {/* الاسم */}
        <div>
          <label className="block mb-1 text-sm">الاسم</label>
          <input
            name="name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-4 py-2 rounded bg-white text-navy"
          />
        </div>

        {/* اسم المستخدم */}
        <div>
          <label className="block mb-1 text-sm">اسم المستخدم</label>
          <input
            name="username"
            value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            className="w-full px-4 py-2 rounded bg-white text-navy"
          />
        </div>

        {/* البريد */}
        <div>
          <label className="block mb-1 text-sm">البريد الإلكتروني</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="w-full px-4 py-2 rounded bg-white text-navy"
          />
        </div>

        {/* كلمة المرور القديمة */}
        <div>
          <label className="block mb-1 text-sm">كلمة المرور القديمة</label>
          <input
            name="oldPassword"
            type="password"
            value={form.oldPassword}
            onChange={e => setForm(f => ({ ...f, oldPassword: e.target.value }))}
            placeholder="مطلوب لتغيير كلمة المرور"
            className="w-full px-4 py-2 rounded bg-white text-navy"
          />
        </div>

        {/* كلمة المرور الجديدة */}
        <div>
          <label className="block mb-1 text-sm">كلمة المرور الجديدة</label>
          <input
            name="newPassword"
            type="password"
            value={form.newPassword}
            onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
            placeholder="اتركه فارغًا إذا لا تريد تغييره"
            className="w-full px-4 py-2 rounded bg-white text-navy"
          />
        </div>

        {/* زر الحفظ */}
        <button
          onClick={() => setShowConfirm(true)}
          disabled={saving}
          className="w-full bg-orange py-2 rounded hover:bg-orange-600 transition font-bold"
        >
          {saving ? 'جاري الحفظ…' : '💾 حفظ التغييرات'}
        </button>
      </div>

      {/* نافذة التأكيد */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white text-navy p-6 rounded shadow-md w-80">
            <h2 className="text-lg font-bold mb-4">تأكيد الحفظ</h2>
            <p className="mb-4">هل تريد حفظ كافة التغييرات الآن؟</p>
            <div className="flex justify-end gap-2">
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
                نعم، حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
