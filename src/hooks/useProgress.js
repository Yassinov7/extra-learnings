import { useEffect } from 'react';
import { supabase } from '../api/supabase';

export default function useProgress(userId, courseId) {
  useEffect(() => {
    if (!userId || !courseId) return;

    const calculateProgress = async () => {
      // 1. جلب كل المحتويات والاختبارات
      const [{ data: contents }, { data: quizzes }] = await Promise.all([
        supabase.from('contents').select('content_id').eq('course_id', courseId),
        supabase.from('quizzes').select('quiz_id').eq('course_id', courseId),
      ]);

      const totalContent = contents.length;
      const totalQuizzes = quizzes.length;

      // 2. جلب ما أنجزه المستخدم
      const [{ data: views }, { data: submissions }] = await Promise.all([
        supabase.from('content_views').select('content_id').eq('user_id', userId),
        supabase.from('submissions').select('quiz_id').eq('user_id', userId),
      ]);

      const viewedCount = views.filter((v) =>
        contents.some((c) => c.content_id === v.content_id)
      ).length;

      const submittedCount = submissions.filter((s) =>
        quizzes.some((q) => q.quiz_id === s.quiz_id)
      ).length;

      // 3. حساب النسبة
      const totalItems = totalContent + totalQuizzes;
      const completedItems = viewedCount + submittedCount;
      const percent = totalItems === 0 ? 0 : ((completedItems / totalItems) * 100).toFixed(2);

      // 4. حفظ التقدم في جدول progress
      await supabase.from('progress').upsert({
        user_id: userId,
        course_id: courseId,
        percent_complete: percent,
        last_accessed: new Date().toISOString(),
      }, {
        onConflict: ['user_id', 'course_id'],
      });
    };

    calculateProgress();
  }, [userId, courseId]);
}
