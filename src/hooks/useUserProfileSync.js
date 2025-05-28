import { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';

export function useUserProfileSync(user) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) {
            setProfile(null);
            setLoading(false);
            return;
        }

        const fetchOrCreateProfile = async () => {
            setLoading(true);
            setError(null);

            try {
                const { data, error } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (error && error.code === 'PGRST116') {
                    // لم يتم العثور على ملف شخصي - ننشئ واحدًا جديدًا
                    const avatarUrlFromUser =
                        user.raw_user_meta_data?.avatar_url ||
                        user.user_metadata?.avatar_url ||
                        null;

                    const nameFromUser =
                        user.raw_user_meta_data?.name ||
                        user.user_metadata?.name ||
                        '';

                    const newProfile = {
                        user_id: user.id,
                        name: nameFromUser,
                        username:
                            user.raw_user_meta_data?.username ||
                            user.user_metadata?.username ||
                            '',
                        avatar_url:
                            avatarUrlFromUser ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                nameFromUser || 'User'
                            )}&background=0D8ABC&color=fff`,
                        role:
                            user.raw_user_meta_data?.role ||
                            user.user_metadata?.role ||
                            'student',
                        email:
                            user.raw_user_meta_data?.email ||
                            user.user_metadata?.email ||
                            '',
                    };

                    const {
                        data: createdProfile,
                        error: insertError,
                    } = await supabase
                        .from('user_profiles')
                        .insert(newProfile)
                        .select()
                        .single();

                    if (insertError) throw insertError;

                    setProfile(createdProfile);
                } else if (data) {
                    setProfile({
                        ...data,
                        avatar_url:
                            data.avatar_url ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                data.name || 'User'
                            )}&background=0D8ABC&color=fff`,
                    });
                }
            } catch (err) {
                console.error('فشل تحميل أو إنشاء الملف الشخصي:', err.message);
                setError(err.message);
            }

            setLoading(false);
        };

        fetchOrCreateProfile();
    }, [user]);

    return { profile, loading, error, setProfile };
}
