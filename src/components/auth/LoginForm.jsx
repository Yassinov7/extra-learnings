import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { supabase } from '../../api/supabase'; // تأكد من وجود الملف
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const schema = yup.object({
  email: yup.string().email('البريد غير صالح').required('البريد مطلوب'),
  password: yup.string().min(6, 'كلمة المرور قصيرة').required('كلمة المرور مطلوبة'),
});

export default function LoginForm() {
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-noto text-right">
      <div>
        <label className="block text-sm mb-1">البريد الإلكتروني</label>
        <input
          type="email"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          {...register('email')}
        />
        {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm mb-1">كلمة المرور</label>
        <input
          type="password"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          {...register('password')}
        />
        {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
      </div>

      {authError && <p className="text-sm text-red-600">{authError}</p>}

      <button
        type="submit"
        className="w-full py-2 bg-orange hover:bg-orange-600 text-white rounded-lg font-semibold transition"
        disabled={loading}
      >
        {loading ? '...جارٍ تسجيل الدخول' : 'تسجيل الدخول'}
      </button>
    </form>
  );
}
