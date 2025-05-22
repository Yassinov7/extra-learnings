import { BrowserRouter, Routes, Route } from 'react-router-dom';

function HomePage() {
  return <h1 className="text-orange-500 font-noto text-2xl">الصفحة الرئيسية</h1>;
}

function LoginPage() {
  return <h1 className="text-orange-500 font-noto text-2xl">تسجيل الدخول</h1>;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}
