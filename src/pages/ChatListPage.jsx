import { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function ChatListPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const fetchContacts = async () => {
      const { data, error } = await supabase
        .from('chat')
        .select('sender_id, receiver_id')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

      if (error || !data) {
        console.error('Error fetching chats:', error);
        setContacts([]);
        return;
      }

      const userIds = new Set();
      data.forEach((msg) => {
        if (msg.sender_id !== user.id) userIds.add(msg.sender_id);
        if (msg.receiver_id !== user.id) userIds.add(msg.receiver_id);
      });

      const idsArray = Array.from(userIds);
      if (idsArray.length === 0) {
        setContacts([]);
        return;
      }

      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select('user_id, name, email, role')
        .in('user_id', idsArray);

      if (usersError || !usersData) {
        console.error('Error fetching users:', usersError);
        setContacts([]);
        return;
      }

      setContacts(usersData);
    };

    fetchContacts();
  }, [user]);

  return (
    <div className="min-h-screen bg-navy text-white p-6 font-noto">
      <h1 className="text-2xl m-3 font-bold mb-4">محادثاتي</h1>
      <Link
        to="/chat/new"
        className="bg-gray-800 text-white px-4 my-4 py-2 rounded hover:bg-orange-600"
      >
        محادثة جديدة
      </Link>
      {contacts.length === 0 ? (
        <p className="bg-orange-600 text-white px-4 my-4 py-2 rounded">لا توجد محادثات بعد.</p>
      ) : (
        <ul className="space-y-4 my-4">
          {contacts.map((u) => (
            <li key={u.user_id} className="bg-white text-black p-4 rounded shadow flex justify-between items-center">
              <div>
                <p className="font-bold ">
                  <span className="text-orange  font-semibold">
                    {u.role === 'teacher' ? ' معلم ' : ' طالب '}
                  </span>
                  {u.name || u.email}</p>
                {/* <p className="text-sm text-gray-600">{u.email}</p> */}
              </div>
              <Link
                to={`/chat/${u.user_id}`}
                className="bg-orange text-white px-4 py-2 rounded hover:bg-orange-600"
              >
                افتح المحادثة
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
