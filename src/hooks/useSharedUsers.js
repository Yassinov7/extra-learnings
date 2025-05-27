import { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useSharedUsers() {
  const { user } = useAuth();
  const [sharedUsers, setSharedUsers] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: myProfile, error: profileErr } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      if (profileErr || !myProfile) return console.error(profileErr);

      const myRole = myProfile.role;

      if (myRole === 'teacher') {
        const { data: users, error: usersErr } = await supabase
          .from('user_profiles')
          .select('user_id, name, username, role, avatar_url, email')
          .neq('user_id', user.id);

        const { data: allCourses } = await supabase
          .from('courses')
          .select('course_id, title, created_by');

        const { data: allEnrollments } = await supabase
          .from('enrollments')
          .select('user_id, course_id');

        const usersWithCourses = users.map(u => {
          let userCourses = [];
          if (u.role === 'teacher') {
            userCourses = allCourses.filter(c => c.created_by === u.user_id);
          } else {
            const enrolledIds = allEnrollments
              .filter(e => e.user_id === u.user_id)
              .map(e => e.course_id);
            userCourses = allCourses.filter(c => enrolledIds.includes(c.course_id));
          }

          return {
            ...u,
            courses: userCourses,
          };
        });

        setSharedUsers(usersWithCourses);
        setCourses(allCourses);
      } else {
        const { data: myEnrolls } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('user_id', user.id);
        const myCourseIds = myEnrolls.map(e => e.course_id);

        const { data: courseData } = await supabase
          .from('courses')
          .select('course_id, title, created_by')
          .in('course_id', myCourseIds);
        setCourses(courseData);

        const { data: allEnrolls } = await supabase
          .from('enrollments')
          .select('user_id, course_id')
          .in('course_id', myCourseIds);
        const otherEnrolls = allEnrolls.filter(e => e.user_id !== user.id);

        const studentIds = Array.from(new Set(otherEnrolls.map(e => e.user_id)));
        const { data: students } = await supabase
          .from('user_profiles')
          .select('user_id, name, username, role, avatar_url, email')
          .in('user_id', studentIds);

        const studentsWithCourses = students.map(st => {
          const yourCourses = otherEnrolls
            .filter(e => e.user_id === st.user_id)
            .map(e => e.course_id);
          return {
            ...st,
            courses: courseData.filter(c => yourCourses.includes(c.course_id)),
          };
        });

        const teacherIds = Array.from(new Set(
          courseData.map(c => c.created_by).filter(id => id !== user.id)
        ));
        const { data: teachers } = await supabase
          .from('user_profiles')
          .select('user_id, name, username, role, avatar_url, email')
          .in('user_id', teacherIds);

        const teachersWithCourses = teachers.map(t => {
          const yourCourses = courseData.filter(c => c.created_by === t.user_id);
          return {
            ...t,
            courses: yourCourses,
          };
        });

        const merged = [...studentsWithCourses, ...teachersWithCourses];
        const unique = Array.from(
          new Map(merged.map(u => [u.user_id, u])).values()
        );
        setSharedUsers(unique);
      }
    };

    if (user?.id) fetchData();
  }, [user]);

  return { sharedUsers, courses };
}
