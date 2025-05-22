import { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function StudentQuizForm({ quizId, questions }) {
    const { user } = useAuth();
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(null);

    const handleSelect = (questionId, optionKey) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: optionKey,
        }));
    };

    const handleSubmit = async () => {
        if (!user || submitted) return;

        let correctCount = 0;

        questions.forEach((q) => {
            if (answers[q.question_id] === q.correct_answer) {
                correctCount += 1;
            }
        });

        const finalScore = ((correctCount / questions.length) * 100).toFixed(2);

        const { error } = await supabase.from('submissions').insert({
            quiz_id: quizId,
            user_id: user.id,
            answers,
            score: finalScore,
        });

        if (!error) {
            setScore(finalScore);
            setSubmitted(true);
        } else {
            alert('لقد قدمت الاختبار مسبقا\n');
        }
    };
    useEffect(() => {
        const checkPreviousSubmission = async () => {
            const { data } = await supabase
                .from('submissions')
                .select('*')
                .eq('quiz_id', quizId)
                .eq('user_id', user?.id)
                .maybeSingle();

            if (data) {
                setSubmitted(true);
                setScore(data.score);
                setAnswers(data.answers || {});
            }
        };

        if (user?.id && quizId) checkPreviousSubmission();
    }, [user, quizId]);

    return (
        <div className="space-y-6">
            {questions.map((q, index) => (
                <div key={q.question_id} className="bg-white text-black p-4 rounded shadow">
                    <p className="font-bold mb-2">{index + 1}. {q.text}</p>
                    <div className="space-y-1">
                        {Object.entries(q.options).map(([key, value]) => {
                            const isCorrect = key === q.correct_answer;
                            const isStudentAnswer = answers[q.question_id] === key;

                            return (
                                <div
                                    key={key}
                                    className={`
                                    px-3 py-2 rounded border
                                    ${isCorrect && submitted ? 'border-green-600 bg-green-100' : ''}
                                    ${isStudentAnswer && !isCorrect && submitted ? 'border-red-600 bg-red-100' : ''}
                                    `}
                                >
                                    <label>
                                        <input
                                            type="radio"
                                            name={q.question_id}
                                            value={key}
                                            checked={isStudentAnswer}
                                            disabled={submitted}
                                            onChange={() => handleSelect(q.question_id, key)}
                                            className="mr-2"
                                        />

                                        {key}. {value}
                                        {submitted && isCorrect && <span className="text-green-600 font-bold ml-2">✔️</span>}
                                        {submitted && isStudentAnswer && !isCorrect && <span className="text-red-600 font-bold ml-2">❌</span>}
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {!submitted ? (
                <button
                    onClick={handleSubmit}
                    className="bg-orange text-white px-4 py-2 rounded hover:bg-orange-600 transition"
                >
                    إرسال الإجابات
                </button>
            ) : (
                <p className="text-green-400 font-bold">✅ تم الإرسال! نتيجتك: {score}%</p>
            )}
            {submitted && (
                <div className="mt-4 text-lg text-center font-bold text-green-400">
                    ✅ لقد أنهيت هذا الاختبار. نتيجتك: {score}%
                </div>
            )}

        </div>
    );
}
