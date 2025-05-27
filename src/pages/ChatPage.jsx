import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../api/supabase';
import useSound from 'use-sound';
import sendSound from '../assets/send.mp3';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

export default function ChatPage() {
  const { receiverId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [receiver, setReceiver] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [playSend] = useSound(sendSound);
  const lastMessageRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const lastRealtimeUpdate = useRef(Date.now());
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const LIMIT = 20;

  const loadMessages = async (initial = false) => {
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
      if (initial) setMessages(filtered.slice(-LIMIT));
      else setMessages(filtered);
      setOffset(filtered.length - LIMIT);
      setHasMore(filtered.length > LIMIT);
      await markMessagesAsRead(filtered);
    }
  };

  const loadMoreMessages = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    const { data } = await supabase
      .from('chat')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('sent_at', { ascending: true });

    const filtered = data.filter(
      (msg) =>
        (msg.sender_id === user.id && msg.receiver_id === receiverId) ||
        (msg.sender_id === receiverId && msg.receiver_id === user.id)
    );

    const newOffset = Math.max(offset - LIMIT, 0);
    const newMessages = filtered.slice(newOffset, offset);
    setMessages((prev) => [...newMessages, ...prev]);
    setOffset(newOffset);
    setHasMore(newOffset > 0);
    setLoadingMore(false);
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
      .select('name, email, role, avatar_url')
      .eq('user_id', receiverId)
      .single();

    if (data) setReceiver(data);
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
      playSend();
      setText('');
      setMessages((prev) => [...prev, data]);
    }
  };

  useEffect(() => {
    if (!user?.id || !receiverId) return;
    loadMessages(true);
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, receiverId]);

  return (
    <div className="max-w-screen-sm mx-auto flex flex-col h-[calc(100vh-64px-80px)]">
      <div className="sticky top-0 z-10 bg-gray-900 text-white px-4 py-3 shadow flex items-center gap-4">
        <Link to="/chats" className="text-white hover:text-orange-500 text-2xl font-bold">←</Link>
        <img
          src={receiver.avatar_url || `https://ui-avatars.com/api/?name=${receiver.name || receiver.email}`}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <span className="font-semibold">
            {receiver.role === 'teacher' ? 'المعلم' : 'الطالب'} {receiver.name || receiver.email}
          </span>
          <span className="text-sm text-gray-400">{isTyping ? 'يكتب الآن...' : ''}</span>
        </div>
      </div>

      <div
        ref={messagesContainerRef}
        onScroll={(e) => {
          if (e.target.scrollTop === 0) loadMoreMessages();
        }}
        className="flex-1 overflow-y-auto px-4 py-2 space-y-2"
      >
        {messages.map((msg, index) => {
          const isMe = msg.sender_id === user.id;
          const sentTime = dayjs(msg.sent_at).format('hh:mm A');
          return (
            <div
              key={msg.chat_id}
              ref={index === messages.length - 1 ? lastMessageRef : null}
              className={`p-3 rounded-xl max-w-[70%] break-words text-sm shadow 
                ${isMe ? 'ml-auto bg-orange-500 text-white' : 'bg-white text-black'}`}
            >
              <div>{msg.message_text}</div>
              <div className="text-xs mt-1 text-right">
                {sentTime} {isMe && msg.is_read ? '✓✓' : ''}
              </div>
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-0 bg-navy px-4 py-3 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="اكتب رسالتك..."
            className="flex-1 px-4 py-2 rounded-full border bg-white text-black placeholder:text-gray-500"
          />
          <button
            onClick={sendMessage}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full"
          >
            إرسال
          </button>
        </div>
      </div>
    </div>
  );
}
