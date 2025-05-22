import { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
export default function NewChatPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_id, name, email, role');

      if (error || !data) {
        console.error('Error fetching users:', error);
        setUsers([]);
        return;
      }

      const filtered = data.filter((u) => u.user_id !== user.id);
      setUsers(filtered);
    };

    fetchUsers();
  }, [user]);

  const startChat = (receiverId) => {
    navigate(`/chat/${receiverId}`);
  };

  return (
    <div className="min-h-screen bg-navy text-white p-6 font-noto">
      <Link
        to="/chats"
        className="bg-gray-800 text-white px-4 my-4 py-2 rounded hover:bg-orange-600"
      >
        العودة
      </Link>
      <h1 className="text-2xl my-3 font-bold my-4">ابدأ محادثة جديدة</h1>
      {users.length === 0 ? (
        <p>لا يوجد مستخدمون متاحون</p>
      ) : (
        <ul className="space-y-4">
          {users.map((u) => (
            <li key={u.user_id} className="bg-white text-black p-4 rounded shadow flex justify-between items-center">
              <div>
                <p className="font-bold">
                  <span className="text-orange font-semibold">
                    {u.role === 'teacher' ? ' معلم ' : ' طالب ' }
                  </span>
                  {u.name || u.email}
                </p>
                {/* <p className="text-sm text-gray-600">{u.email}</p> */}
              </div>
              <button
                onClick={() => startChat(u.user_id)}
                className="bg-orange text-white px-4 py-2 rounded hover:bg-orange-600"
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
