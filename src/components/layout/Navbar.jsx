import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { Home, Book, MessageCircle, BookPlus, UserCircle,PenTool } from 'lucide-react';

export default function Navbar() {
  const { userData, signOut } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  if (!userData) return null;

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const linkClass = ({ isActive }) =>
    `hover:text-orange transition flex items-center gap-2 px-2 py-1 ${
      isActive ? 'text-orange font-bold' : ''
    }`;

  return (
    <nav className="bg-navy text-white px-4 py-3 font-noto shadow-md fixed top-0 w-full z-50">
      <div className="flex justify-between items-center max-w-6xl mx-auto">

        {/* اسم المنصة */}
        <div className="text-lg md:text-xl font-bold text-orange">
          Extra Learning
        </div>

        {/* روابط في الشاشات الكبيرة فقط */}
        <div className="hidden md:flex items-center space-x-4 text-sm">
          <NavLink to="/" className={linkClass}>
            <Home size={18} /> الصفحة الرئيسية
          </NavLink>

          <NavLink to="/courses" className={linkClass}>
            <BookPlus size={18} /> الدورات
          </NavLink>

          <NavLink to="/chats" className={linkClass}>
            <MessageCircle size={18} /> المحادثات
          </NavLink>

          {userData.role === 'teacher' && (
            <NavLink to="/managing-courses" className={linkClass}>
              <PenTool size={18} /> إدارة الدورات
            </NavLink>
          )}

          {userData.role === 'student' && (
            <NavLink to="/my-courses" className={linkClass}>
              <Book size={18} /> دوراتي
            </NavLink>
          )}
        </div>

        {/* أيقونة الملف الشخصي */}
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setDropdownOpen(!dropdownOpen)} aria-label="Profile">
            <UserCircle className="w-10 h-10 text-white hover:text-orange transition" />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 mt-2 w-56 bg-white text-navy rounded-md shadow-lg z-50 p-4 text-sm">
              <p className="font-bold text-base">{userData.name}</p>
              <p className="text-xs text-gray-500 mb-3">{userData.email}</p>
              <hr className="my-2" />

              <NavLink
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="block mb-2 hover:text-orange"
              >
                تعديل الملف الشخصي
              </NavLink>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full text-right mt-1 text-red-600 hover:text-red-800"
              >
                تسجيل الخروج
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
