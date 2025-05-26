import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNav from './BottomNav';

export default function ProtectedLayout() {
  return (
    <>
      <Navbar />
      <hr />
      <main className="pt-16 pb-20 min-h-screen bg-navy text-white font-noto">
        <Outlet />
      </main>
      <BottomNav />
    </>
  );
}
