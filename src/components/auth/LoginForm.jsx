import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { supabase } from '../../api/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { X } from 'lucide-react'; // أيقونة الخروج

const schema = yup.object({
  email: yup.string().email('البريد غير صالح').required('البريد مطلوب'),
  password: yup.string().min(6, 'كلمة المرور قصيرة').required('كلمة المرور مطلوبة'),
});

export default function LoginForm({ onClose }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const onSubmit = async ({ email, password }) => {
    setLoading(true);
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) setAuthError(error.message);
    else navigate('/dashboard');

    setLoading(false);
  };

  return (
    <div className="relative bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto font-noto">
      {/* زر الخروج  */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-3 left-3 text-gray-400 hover:text-red-500"
        title="إغلاق"
      >
        <X />
      </button>
      

      {/* اسم المنصة */}
      <h2 className="text-center text-2xl font-bold text-orange mb-6">
        🎓 Extra Learning
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-right">
        <div>
          <label className="block text-sm mb-1">البريد الإلكتروني</label>
          <input
            type="email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">كلمة المرور</label>
          <input
            type="password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {authError && <p className="text-sm text-red-600">{authError}</p>}

        <button
          type="submit"
          className="w-full py-2 bg-orange hover:bg-orange-600 text-white rounded-lg font-semibold transition"
          disabled={loading}
        >
          {loading ? '...جارٍ تسجيل الدخول' : 'تسجيل الدخول'}
        </button>

        <Link
          to="/register"
          className="w-full block text-center py-2 mt-2 bg-white text-orange border border-orange hover:bg-orange hover:text-white rounded-lg font-semibold transition"
        >
          إنشاء حساب جديد
        </Link>
      </form>
    </div>
  );
}
