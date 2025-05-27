import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSharedUsers } from '../hooks/useSharedUsers';
import { useAuth } from '../contexts/AuthContext';

export default function NewChatPage() {
  const navigate = useNavigate();
  const { sharedUsers, courses } = useSharedUsers();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('');

  const myProfile = sharedUsers.find(u => u.user_id === user?.id);
  const myRole = myProfile?.role;

  const filtered = sharedUsers.filter(u => {
    if (u.user_id === user?.id) return false;
    if (activeTab === 'teachers') return u.role === 'teacher';
    if (activeTab === 'students') return u.role !== 'teacher';
    if (activeTab === 'byCourse' && selectedCourse) {
      return u.courses.some(c => c.course_id === selectedCourse);
    }
    return true;
  });

  const startChat = id => navigate(`/chat/${id}`);

  return (
    <div className="min-h-screen bg-navy text-white p-6 font-noto">
      <Link
        to="/chats"
        className="bg-gray-800 px-4 py-2 rounded hover:bg-orange-600 mb-4 inline-block"
      >
        العودة
      </Link>

      <h1 className="text-2xl font-bold mb-4">ابدأ محادثة جديدة</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        {['all', 'teachers', 'students', 'byCourse'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded ${activeTab === tab ? 'bg-orange' : 'bg-gray-700'}`}
          >
            {{
              all: 'الكل',
              teachers: 'المعلمون',
              students: 'الطلاب',
              byCourse: 'حسب الدورة',
            }[tab]}
          </button>
        ))}
      </div>

      {activeTab === 'byCourse' && (
        <select
          value={selectedCourse}
          onChange={e => setSelectedCourse(e.target.value)}
          className="mb-6 p-2 bg-white text-black rounded"
        >
          <option value="">اختر دورة</option>
          {courses.map(c => (
            <option key={c.course_id} value={c.course_id}>
              {c.title}
            </option>
          ))}
        </select>
      )}

      {filtered.length === 0 ? (
        <p>لا يوجد مستخدمون في هذا القسم.</p>
      ) : (
        <ul className="space-y-4">
          {filtered.map(u => (
            <li
              key={u.user_id}
              className="bg-white text-black p-4 rounded shadow flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                {u.avatar_url ? (
                  <img
                    src={u.avatar_url}
                    alt="avatar"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-xl text-gray-600">
                    {u.username?.[0] || u.name?.[0] || '?'}
                  </div>
                )}

                <div>
                  <p className={`font-bold ${u.role === 'teacher' ? 'text-blue-600' : 'text-green-600'}`}>
                    {u.role === 'teacher' ? '👨‍🏫 معلم' : '🎓 طالب'}
                  </p>

                  {myRole === 'teacher' || u.role === 'teacher' ? (
                    <p className="font-semibold">{u.name}</p>
                  ) : (
                    <p className="font-semibold">{u.username}</p>
                  )}

                  {myRole === 'teacher' && u.role !== 'teacher' && u.email && (
                    <p className="text-sm text-gray-500">{u.email}</p>
                  )}

                  {u.courses?.length > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      {u.courses.map(c => c.title).join('، ')}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => startChat(u.user_id)}
                className="bg-orange px-4 py-2 rounded hover:bg-orange-600"
              >
                ابدأ المحادثة
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
