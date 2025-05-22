import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { supabase } from '../../api/supabase';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const schema = yup.object({
  name: yup.string().required('الاسم مطلوب'),
  email: yup.string().email('بريد غير صالح').required('البريد مطلوب'),
  password: yup.string().min(6, 'كلمة المرور قصيرة').required('كلمة المرور مطلوبة'),
  role: yup.string().oneOf(['student', 'teacher'], 'الدور غير صالح').required('اختر دورك'),
});

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');

  const onSubmit = async ({ name, email, password, role }) => {
    setLoading(true);
    setRegisterError('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-noto text-right">
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

      {registerError && <p className="text-sm text-red-600">{registerError}</p>}

      <button
        type="submit"
        className="w-full py-2 bg-orange hover:bg-orange-600 text-white rounded-lg font-semibold transition"
        disabled={loading}
      >
        {loading ? '...جارٍ التسجيل' : 'تسجيل حساب'}
      </button>
    </form>
  );
}
