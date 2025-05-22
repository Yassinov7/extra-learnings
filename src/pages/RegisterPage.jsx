import RegisterForm from '../components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-navy text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white text-black rounded-xl shadow-xl p-6 font-noto">
        <h2 className="text-2xl font-bold mb-4 text-center text-orange">إنشاء حساب جديد</h2>
        <RegisterForm />
      </div>
    </div>
  );
}
