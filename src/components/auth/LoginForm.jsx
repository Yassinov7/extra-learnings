import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { supabase } from '../../api/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const emailRef = useRef(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

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
      {/* زر الإغلاق */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-3 left-3 text-gray-400 hover:text-red-500"
        title="إغلاق"
      >
        <X />
      </button>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-right relative">
        <div>
          <label className="block text-sm mb-1">البريد الإلكتروني</label>
          <input
            type="email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            {...register('email')}
            ref={(e) => {
              register('email').ref(e);
              emailRef.current = e;
            }}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="relative">
          <label className="block text-sm mb-1">كلمة المرور</label>
          <input
            type={showPassword ? 'text' : 'password'}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-4/6  left-3 transform -translate-y-1/2 text-gray-500 hover:text-orange-500"
            tabIndex={-1}
            aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
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

        <div className="mt-4 text-center">
          <div className="inline-block px-6 py-2 text-black rounded-lg font-semibold transition">
            ليس لديك حساب؟{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-orange underline hover:text-navy"
            >
              إنشاء حساب جديد
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
