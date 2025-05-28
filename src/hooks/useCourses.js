// hooks/useCourses.js
import { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';

export default function useCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('course_id, title, description, cover_url, created_at, category_id')
        .order('created_at', { ascending: false });

      if (error) setError(error.message);
      else setCourses(data);

      setLoading(false);
    };

    fetchCourses();
  }, []);

  return { courses, loading, error };
}
