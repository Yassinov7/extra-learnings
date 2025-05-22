import { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';

export default function useEnrolledCourses(userId) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchCourses = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('enrollments')
        .select('courses(*)')
        .eq('user_id', userId);

      if (error) {
        console.error(error);
        setCourses([]);
      } else {
        // نستخرج فقط الدورة نفسها
        setCourses(data.map((enroll) => enroll.courses));
      }

      setLoading(false);
    };

    fetchCourses();
  }, [userId]);

  return { courses, loading };
}
