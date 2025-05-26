import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { supabase } from '../../api/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { X } from 'lucide-react';

const schema = yup.object({
  name: yup.string().required('الاسم مطلوب'),
  username: yup.string().required('اسم المستخدم مطلوب'),
  email: yup.string().email('بريد غير صالح').required('البريد مطلوب'),
  password: yup.string().min(6, 'كلمة المرور قصيرة').required('كلمة المرور مطلوبة'),
  role: yup.string().oneOf(['student', 'teacher'], 'الدور غير صالح').required('اختر دورك'),
});

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({ resolver: yupResolver(schema) });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);

  const onSubmit = async ({ name, username, email, password, role }) => {
    setLoading(true);
    setRegisterError('');

    let avatar_url = null;

    if (avatarFile) {
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(`public/${Date.now()}-${avatarFile.name}`, avatarFile);

      if (error) {
        setRegisterError('فشل في رفع الصورة');
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(data.path);

      avatar_url = publicUrlData.publicUrl;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role, username, avatar_url },
      },
    });

    if (error) {
      setRegisterError(error.message);
    } else {
      navigate('/login');
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md mt-10 font-noto relative">
      {/* Exit button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-3 left-3 text-gray-400 hover:text-red-500"
        title="إغلاق"
      >
        <X />
      </button>

      {/* Platform title */}
      <h2 className="text-2xl font-bold text-orange text-center mb-6">📘 Extra Learning</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-right">
        <div>
          <label className="block text-sm mb-1">الاسم الكامل</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg focus:ring-orange-500 focus:outline-none"
            {...register('name')}
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">اسم المستخدم</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg focus:ring-orange-500 focus:outline-none"
            {...register('username')}
          />
          {errors.username && <p className="text-sm text-red-600">{errors.username.message}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">البريد الإلكتروني</label>
          <input
            type="email"
            className="w-full px-4 py-2 border rounded-lg focus:ring-orange-500 focus:outline-none"
            {...register('email')}
          />
          {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">كلمة المرور</label>
          <input
            type="password"
            className="w-full px-4 py-2 border rounded-lg focus:ring-orange-500 focus:outline-none"
            {...register('password')}
          />
          {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">الدور</label>
          <select
            className="w-full px-4 py-2 border rounded-lg focus:ring-orange-500 focus:outline-none"
            {...register('role')}
          >
            <option value="">اختر</option>
            <option value="student">طالب</option>
            <option value="teacher">معلم</option>
          </select>
          {errors.role && <p className="text-sm text-red-600">{errors.role.message}</p>}
        </div>

        <div>
          <label className="block  text-sm mb-1">الصورة الشخصية (اختياري)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files[0])}
            className="w-full border-2 rounded"
          />
        </div>

        {registerError && <p className="text-sm text-red-600">{registerError}</p>}

        <button
          type="submit"
          className="w-full py-2 bg-orange hover:bg-orange-600 text-white rounded-lg font-semibold transition"
          disabled={loading}
        >
          {loading ? '...جارٍ التسجيل' : 'تسجيل حساب'}
        </button>

        <Link
          to={`/login`}
          className="w-full block text-center py-2 mt-2 bg-white text-orange border border-orange hover:bg-orange hover:text-white rounded-lg font-semibold transition"
        >
          لديك حساب بالفعل؟ تسجيل دخول
        </Link>
      </form>
    </div>
  );
}
