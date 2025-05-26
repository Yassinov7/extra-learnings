import { NavLink } from 'react-router-dom';
import { Home, Book, MessageCircle, BookPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function BottomNav() {
  const { userData } = useAuth();

  if (!userData) return null;

  const navItems = [
    {
      to: '/',
      label: 'الرئيسية',
      icon: <Home size={20} />,
    },
    {
      to: '/courses',
      label: 'الدورات',
      icon: <BookPlus size={20} />,
    },
    {
      to: userData.role === 'teacher' ? '/managing-courses' : '/my-courses',
      label: 'دوراتي',
      icon: <Book size={20} />,
    },
    {
      to: '/chats',
      label: 'المحادثات',
      icon: <MessageCircle size={20} />,
      
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-navy border-t border-gray-700 z-50 font-noto">
      <div className="flex justify-around items-center text-sm text-white">
        {navItems.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 px-3 ${
                isActive ? 'text-orange font-bold' : 'text-white'
              }`
            }
          >
            {item.icon}
            <span className="mt-1">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
