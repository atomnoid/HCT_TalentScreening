import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getApplicantProfile,
  getQuestionsByRole,
} from "../services/questionService";
import { createSubmission } from "../services/submissionService";

const QUIZ_DURATION_SECONDS = 15 * 60;

export default function Quiz() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION_SECONDS);
  const hasSubmittedRef = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    async function loadQuiz() {
      try {
        const profileData = await getApplicantProfile();
        setProfile(profileData);
        console.log("Profile Data:", profileData);
        console.log("Application Role ID:", profileData.application_role_id);

        const questionData = await getQuestionsByRole(
          profileData.application_role_id,
        );

        setQuestions(questionData);
      } catch (err) {
        console.error(err);
        setError(err.message || "Unable to load quiz.");
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, []);

  useEffect(() => {
    if (loading) {
      return undefined;
    }

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;

          if (!hasSubmittedRef.current) {
            handleSubmit();
          }

          return 0;
        }

        return prevTime - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [loading]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = useCallback(
    async (e) => {
      if (hasSubmittedRef.current) {
        return;
      }

      hasSubmittedRef.current = true;

      if (e?.preventDefault) {
        e.preventDefault();
      }

      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }

      try {
        const totalQuestions = questions.length;
        let score = 0;

        questions.forEach((question) => {
          if (answers[question.id] === question.correct_option) {
            score += 1;
          }
        });

        await createSubmission({
          applicant_id: profile.id,
          role_id: profile.application_role_id,
          score,
          total_questions: totalQuestions,
        });

        navigate("/thank-you");
      } catch (err) {
        console.error(err);
        hasSubmittedRef.current = false;
        setError(err.message || "Unable to submit quiz.");
      }
    },
    [answers, navigate, profile, questions],
  );

  const formatTime = (value) => {
    const minutes = String(Math.floor(value / 60)).padStart(2, "0");
    const seconds = String(value % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <p className="text-slate-600">Loading quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-5xl bg-white rounded-2xl shadow p-6">
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-700">Time Remaining</p>
            <p className="text-2xl font-bold text-slate-900">{formatTime(timeLeft)}</p>
          </div>
          <p className="text-sm text-slate-600">Role: {profile?.application_role_id}</p>
        </div>

        <h1 className="mt-6 text-2xl font-bold text-slate-800">Quiz</h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <p className="font-semibold text-slate-800">
                {index + 1}. {question.question}
              </p>

              <div className="mt-4 grid gap-3">
                {["A", "B", "C", "D"].map((optionKey) => {
                  const optionValue =
                    question[`option_${optionKey.toLowerCase()}`];
                  return (
                    <label
                      key={optionKey}
                      className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-700 hover:border-blue-500"
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={optionKey}
                        checked={answers[question.id] === optionKey}
                        onChange={() =>
                          handleAnswerChange(question.id, optionKey)
                        }
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="font-medium">{optionKey}.</span>
                      <span>{optionValue}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-2xl bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
