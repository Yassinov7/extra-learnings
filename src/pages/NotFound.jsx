import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-navy text-white flex flex-col items-center justify-center text-center p-6 font-noto">
            <h1 className="text-6xl font-bold text-orange mb-2">404</h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-2"> الصفحة غير موجودة !</h2>
            <p className="text-gray-300 mb-6">يبدو أنك ضللت الطريق... لنعد إلى المسار الصحيح! 🚀</p>
            <img
                src="\assets\images\undraw_page-eaten_b2rt.svg"
                alt="404"
                className="w-64 h-auto mb-6"
            />

            <Link
                to="/"
                className="bg-orange text-white px-6 py-3 rounded hover:bg-orange-600 transition"
            >
                العودة إلى الصفحة الرئيسية
            </Link>
        </div>
    );
}
