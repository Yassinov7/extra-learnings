import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const { userData, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!userData) return null;

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const linkClass = ({ isActive }) =>
    `hover:text-orange transition block px-2 py-1 ${
      isActive ? 'text-orange font-bold' : ''
    }`;

  return (
    <nav className="bg-navy text-white px-4 py-3 font-noto shadow-md">
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        {/* اسم المنصة */}
        <div className="text-lg md:text-xl font-bold text-orange">
          Extra Learning | اكسترا للتعليم
        </div>

        {/* Toggle Menu - Mobile */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-white">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* روابط - Desktop */}
        <div className="hidden md:flex items-center space-x-4 text-sm">
          <NavLink to="/courses" className={linkClass}>
            الدورات
          </NavLink>

          {userData.role === 'teacher' && (
            <NavLink to="/managing-courses" className={linkClass}>
              إدارة الدورات
            </NavLink>
          )}

          {userData.role === 'student' && (
            <>
              <NavLink to="/my-courses" className={linkClass}>
                📘 دوراتي
              </NavLink>
              <NavLink to="/my-results" className={linkClass}>
                🏅 نتائجي
              </NavLink>
            </>
          )}

          <NavLink to="/chats" className={linkClass}>
            💬 المحادثات
          </NavLink>

          <span className="text-gray-300">{userData.name}</span>

          <button
            onClick={handleLogout}
            className="bg-orange text-white px-3 py-1 rounded hover:bg-orange-600 transition"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>

      {/* روابط - Mobile */}
      {menuOpen && (
        <div className="md:hidden mt-3 space-y-2 text-sm text-right">
          <NavLink to="/courses" className={linkClass} onClick={toggleMenu}>
            📚 الدورات
          </NavLink>

          {userData.role === 'teacher' && (
            <NavLink
              to="/managing-courses"
              className={linkClass}
              onClick={toggleMenu}
            >
              🛠 إدارة الدورات
            </NavLink>
          )}

          {userData.role === 'student' && (
            <>
              <NavLink to="/my-courses" className={linkClass} onClick={toggleMenu}>
                📘 دوراتي
              </NavLink>
              <NavLink to="/my-results" className={linkClass} onClick={toggleMenu}>
                🏅 نتائجي
              </NavLink>
            </>
          )}

          <NavLink to="/chats" className={linkClass} onClick={toggleMenu}>
            💬 المحادثات
          </NavLink>

          <div className="px-2 text-gray-300">{userData.name}</div>

          <button
            onClick={() => {
              toggleMenu();
              handleLogout();
            }}
            className="w-full text-left px-2 py-1 text-white bg-orange rounded hover:bg-orange-600 transition"
          >
            تسجيل الخروج
          </button>
        </div>
      )}
    </nav>
  );
}
