import LoginForm from '../components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-navy text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white text-black rounded-xl shadow-xl p-6 font-noto">
        <h2 className="text-2xl font-bold mb-4 text-center text-orange">تسجيل الدخول</h2>
        <LoginForm />
      </div>
    </div>
  );
}
