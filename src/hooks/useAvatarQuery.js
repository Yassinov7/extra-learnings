// hooks/useAvatarQuery.js
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../api/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function useAvatarQuery(size = 128) {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  // دالة fetch يمكن استدعاؤها يدوياً لتحديث الصورة
  const fetchAvatar = useCallback(async () => {
    if (!user) {
      setAvatarUrl(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('user_profiles')
      .select('avatar_url, name')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching avatar:', error.message);
      setAvatarUrl(null);
    } else {
      const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=0D8ABC&color=fff&size=${size}`;
      setAvatarUrl(data.avatar_url || fallback);
    }

    setLoading(false);
  }, [user, size]);

  useEffect(() => {
    fetchAvatar();
  }, [fetchAvatar]);

  return { avatarUrl, loading, refreshAvatar: fetchAvatar };
}
