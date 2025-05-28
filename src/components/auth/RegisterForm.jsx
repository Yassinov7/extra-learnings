import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { supabase } from '../../api/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { X } from 'lucide-react';

const passwordRules = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const schema = yup.object({
  name: yup.string().required('الاسم مطلوب'),
  username: yup.string().required('اسم المستخدم مطلوب'),
  email: yup.string().email('بريد غير صالح').required('البريد مطلوب'),
  password: yup
    .string()
    .required('كلمة المرور مطلوبة')
    .matches(
      passwordRules,
      'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، تشمل حروف كبيرة وصغيرة وأرقام ورموز'
    ),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'كلمة المرور غير متطابقة')
    .required('تأكيد كلمة المرور مطلوب'),
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

  const onSubmit = async ({ name, username, email, password, role }) => {
    setLoading(true);
    setRegisterError('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role, username },
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
      {/* <h2 className="text-2xl font-bold text-orange text-center mb-6">📘 Extra Learning</h2> */}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-right">
        <div>
          <label className="block text-sm mb-1">الاسم الكامل</label>
          <input
            type="text"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-orange-400'
              }`}
            {...register('name')}
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">اسم المستخدم</label>
          <input
            type="text"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.username ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-orange-400'
              }`}
            {...register('username')}
          />
          {errors.username && <p className="text-sm text-red-600">{errors.username.message}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">البريد الإلكتروني</label>
          <input
            type="email"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-orange-400'
              }`}
            {...register('email')}
          />
          {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">كلمة المرور</label>
          <input
            type="password"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.password ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-orange-400'
              }`}
            {...register('password')}
          />
          {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">تأكيد كلمة المرور</label>
          <input
            type="password"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-orange-400'
              }`}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-2">اختر دورك</label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="student"
                {...register('role')}
                className="cursor-pointer"
              />
              <span>طالب</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="teacher"
                {...register('role')}
                className="cursor-pointer"
              />
              <span>معلم</span>
            </label>
          </div>
          {errors.role && <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>}
        </div>

        {registerError && <p className="text-sm text-red-600">{registerError}</p>}

        <button
          type="submit"
          className="w-full py-2 bg-orange hover:bg-orange-600 text-white rounded-lg font-semibold transition"
          disabled={loading}
        >
          {loading ? '...جارٍ التسجيل' : 'تسجيل حساب'}
        </button>

        {/* زر تسجيل الدخول المحسن */}
        <div className="mt-4 text-center">
          <div
            className="inline-block px-6 py-2  text-black rounded-lg font-semibold transition"
          >لديك حساب بالفعل؟
            <button
              type="button"
              onClick={() => navigate('/login')}
              className='text-orange underline hover:text-navy'>
              تسجيل الدخول
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
