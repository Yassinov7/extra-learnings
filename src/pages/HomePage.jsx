import { Link } from 'react-router-dom';
import { BookOpen, Users, ShieldCheck, Star } from 'lucide-react';

export default function HomePage() {
    return (
        <div className="bg-navy text-white font-noto min-h-screen">

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-orange to-yellow-400 text-navy py-16 px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
                    <div>
                        <h1 className="text-4xl md:text-5xl text-center font-bold mb-4 leading-tight">
                            <span className="text-navy">Extra Learning</span>
                        </h1>
                        <p className="text-lg mb-6 max-w-md">
                            منصتك الشاملة للتعلم أونلاين. انضم إلى آلاف الطلاب والمعلمين وابدأ رحلتك التعليمية الآن.
                        </p>
                        <div className="flex gap-4">
                            <Link to="/register" className="bg-navy text-white px-6 py-3 rounded shadow hover:bg-orange transition  border-navy">
                                إنشاء حساب
                            </Link>
                            <Link to="/login" className="border border-navy px-6 py-3 rounded text-navy bg-white hover:bg-orange hover:text-white transition">
                                تسجيل الدخول
                            </Link>
                        </div>
                    </div>

                    <img
                        src="\assets\images\computer-graphics-advices-tips-watching-digital-design-masterclass-online-course-helpful-information-painting-exam-preparation.png"
                        alt="Online Learning"
                        className="w-72 md:w-96"
                    />
                </div>
            </section>

            {/* Features Section */}
            <section className="max-w-6xl mx-auto py-16 px-6 grid gap-8 md:grid-cols-4 text-center">
                <div>
                    <BookOpen size={40} className="text-orange mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">دورات متنوعة</h3>
                    <p className="text-sm text-gray-300">اختر من بين مئات الدورات التعليمية في مختلف المجالات.</p>
                </div>

                <div>
                    <Users size={40} className="text-orange mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">مجتمع نشط</h3>
                    <p className="text-sm text-gray-300">تفاعل مع المعلمين والطلاب وشارك أفكارك وتجاربك.</p>
                </div>

                <div>
                    <ShieldCheck size={40} className="text-orange mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">أمان وموثوقية</h3>
                    <p className="text-sm text-gray-300">بيئة تعليمية آمنة تدعم خصوصيتك وتقدم محتوى موثوق.</p>
                </div>

                <div>
                    <Star size={40} className="text-orange mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">معلمون محترفون</h3>
                    <p className="text-sm text-gray-300">تعلم من أفضل المعلمين ذوي الخبرة العالية.</p>
                </div>
            </section>

            {/* Course Preview */}
            <section className="bg-white text-navy py-16 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-6">إحصائيات منصتنا</h2>
                    <p className="mb-10 text-gray-600">نفتخر بنمو مجتمعنا التعليمي يوماً بعد يوم!</p>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-navy text-white p-6 rounded shadow hover:bg-orange transition">
                            <h4 className="text-4xl font-bold mb-2">+500</h4>
                            <p className="text-lg">طالب مسجل</p>
                        </div>

                        <div className="bg-navy text-white p-6 rounded shadow hover:bg-orange transition">
                            <h4 className="text-4xl font-bold mb-2">+80</h4>
                            <p className="text-lg">معلم معتمد</p>
                        </div>

                        <div className="bg-navy text-white p-6 rounded shadow hover:bg-orange transition">
                            <h4 className="text-4xl font-bold mb-2">+120</h4>
                            <p className="text-lg">دورة تعليمية</p>
                        </div>
                    </div>
                </div>
            </section>


            {/* Final CTA Section */}
            <section className="bg-orange text-white py-16 px-6 text-center">
                <h2 className="text-3xl font-bold mb-4">🚀 هل أنت مستعد للانطلاق؟</h2>
                <p className="mb-6">ابدأ التعلم الآن وحقق أهدافك!</p>
                <Link to="/register" className="bg-white text-orange font-bold px-6 py-3 rounded shadow hover:bg-navy hover:text-white transition">
                    سجّل الآن مجاناً
                </Link>
            </section>
        </div>
    );
}
