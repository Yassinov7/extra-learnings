import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext'; // ✅ مهم
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedLayout from './components/layout/ProtectedLayout';
import MyCoursesPage from './pages/MyCoursesPage';
import QuizDetailPage from './pages/QuizDetailPage';
import MyResultsPage from './pages/MyResultsPage';
import QuizResultsPage from './pages/QuizResultsPage';
import CourseResultsPage from './pages/CourseResultsPage';
import NewChatPage from './pages/NewChatPage';
import ChatListPage from './pages/ChatListPage';
import ChatPage from './pages/ChatPage';
import RedirectToHome from './pages/RedirectToHome.jsx';
import CourseManager from './pages/CourseManager.jsx';
import CourseAdder from './pages/CourseAdder.jsx';
import NotFound from './pages/NotFound.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import HomePage from './pages/HomePage.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
export default function App() {
  return (
    <AuthProvider> {/* ✅ غلّف كل شيء هنا */}
      <BrowserRouter>
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>

          {/* صفحات بدون تسجيل */}
          <Route path="/" element={<RedirectToHome />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/Home" element={<HomePage />} />

          {/* صفحات بعد تسجيل الدخول */}
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/my-courses" element={<MyCoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route path="/quizzes/:quizId" element={<QuizDetailPage />} />
            <Route path="/my-results" element={<MyResultsPage />} />
            <Route path="/quizzes/:quizId/results" element={<QuizResultsPage />} />
            <Route path="/courses/:courseId/results" element={<CourseResultsPage />} />
            <Route path="/adding-course" element={<CourseAdder />} />
            <Route path="/managing-courses" element={<CourseManager />} />
            <Route path="/chat/new" element={<NewChatPage />} />
            <Route path="/chats" element={<ChatListPage />} />
            <Route path="/chat/:receiverId" element={<ChatPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/categories" element={<CategoriesPage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
