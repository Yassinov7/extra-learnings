import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../api/supabase';

export default function ChatPage() {
  const { receiverId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverRole, setReceiverRole] = useState('');
  const lastMessageRef = useRef(null);

  let lastRealtimeUpdate = useRef(Date.now());

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('chat')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('sent_at', { ascending: true });

    if (!error) {
      const filtered = data.filter(
        (msg) =>
          (msg.sender_id === user.id && msg.receiver_id === receiverId) ||
          (msg.sender_id === receiverId && msg.receiver_id === user.id)
      );
      setMessages(filtered);
      await markMessagesAsRead(filtered);
    }
  };

  const markMessagesAsRead = async (msgs) => {
    const unreadIds = msgs
      .filter(
        (msg) =>
          msg.receiver_id === user.id &&
          msg.sender_id === receiverId &&
          msg.is_read === false
      )
      .map((msg) => msg.chat_id);

    if (unreadIds.length > 0) {
      await supabase
        .from('chat')
        .update({ is_read: true })
        .in('chat_id', unreadIds);
    }
  };

  const fetchReceiver = async () => {
    const { data } = await supabase
      .from('user_profiles')
      .select('name, email, role')
      .eq('user_id', receiverId)
      .single();

    if (data) {
      setReceiverName(data.name || data.email);
      setReceiverRole(data.role || data.email);
    }
  };

  const sendMessage = async () => {
    if (!text.trim()) return;

    const { data, error } = await supabase
      .from('chat')
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        message_text: text,
        is_read: false,
      })
      .select()
      .single();

    if (!error && data) {
      setText('');
      setMessages((prev) => [...prev, data]);
    }
  };

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (!user?.id || !receiverId) return;

    loadMessages();
    fetchReceiver();

    const channel = supabase
      .channel('chat-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat',
        },
        async (payload) => {
          const newMessage = payload.new;
          if (!newMessage) return;

          const isRelated =
            (newMessage.sender_id === user.id && newMessage.receiver_id === receiverId) ||
            (newMessage.sender_id === receiverId && newMessage.receiver_id === user.id);

          if (isRelated) {
            setMessages((prev) => {
              const exists = prev.find((msg) => msg.chat_id === newMessage.chat_id);
              return exists ? prev : [...prev, newMessage];
            });

            lastRealtimeUpdate.current = Date.now();
            if (
              newMessage.receiver_id === user.id &&
              newMessage.sender_id === receiverId &&
              newMessage.is_read === false
            ) {
              

              await supabase
                .from('chat')
                .update({ is_read: true })
                .eq('chat_id', newMessage.chat_id);
            }
          }
        }
      )
      .subscribe();

    const intervalId = setInterval(() => {
      const now = Date.now();
      if (now - lastRealtimeUpdate.current > 3000) {
        loadMessages(); // لم يصل شيء جديد من realtime → نعمل polling
      }
    }, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(intervalId);
    };
  }, [user?.id, receiverId]);
  return (
    <div className="min-h-screen bg-navy text-white p-6 font-noto">
      <Link
        to="/chats"
        className="bg-gray-800 text-white px-4 my-4 py-2 rounded hover:bg-orange-600"
      >
        العودة
      </Link>
      <h1 className="text-xl font-bold my-4">
        المحادثة مع:
        <span className="text-orange">
          {receiverRole === 'teacher' ? ' المعلم ' : ' الطالب '} {receiverName}
        </span>
      </h1>

      <div className="bg-white text-black p-4 rounded-lg shadow h-[400px] overflow-y-scroll space-y-2 mb-4">
        {messages.map((msg, index) => {
          const isLast = index === messages.length - 1;
          const isMe = msg.sender_id === user.id;
          const sentTime = new Date(msg.sent_at).toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={msg.chat_id}
              ref={isLast ? lastMessageRef : null}
              className={`p-2 rounded-lg animate-fadeInScale
        ${isMe ? 'bg-orange text-white ml-auto' : 'bg-gray-200 text-black'}
        max-w-[70%]`}
            >
              <div>{msg.message_text}</div>
              <div className={`text-xs mt-1 ${isMe ? 'text-white/80' : 'text-black/60'}`}>
                {sentTime} {isMe && msg.is_read ? '✓✓' : ''}
              </div>
            </div>
          );
        })}

      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="اكتب رسالتك..."
          className="flex-1 max-w-70 px-4 py-2 rounded border"
        />
        <button
          onClick={sendMessage}
          className="flex-1 bg-orange max-w-25 text-white px-4 py-2 rounded hover:bg-orange-600"
        >
          إرسال
        </button>
      </div>
    </div>
  );
}
