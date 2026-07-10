import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getApplicantProfile,
  getQuestionsByRole,
} from "../services/questionService";
import { getRoleById } from "../services/roleService";
import { createSubmission } from "../services/submissionService";

const DEFAULT_QUIZ_DURATION_SECONDS = 15 * 60;

export default function Quiz() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showInstructions, setShowInstructions] = useState(true);
  const [agreedToInstructions, setAgreedToInstructions] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_QUIZ_DURATION_SECONDS);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasSubmittedRef = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    async function loadQuiz() {
      try {
        const profileData = await getApplicantProfile();
        setProfile(profileData);

        const questionData = await getQuestionsByRole(profileData.application_role_id);
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

  const handleStartQuiz = useCallback(async () => {
    if (!profile || isSubmitting) {
      return;
    }

    try {
      setError("");
      const roleData = await getRoleById(profile.application_role_id);
      const parsedMinutes = Number(roleData?.quiz_duration_minutes);
      const resolvedDuration =
        Number.isFinite(parsedMinutes) && parsedMinutes > 0
          ? parsedMinutes * 60
          : DEFAULT_QUIZ_DURATION_SECONDS;

      setTimeLeft(resolvedDuration);
      setShowInstructions(false);
      setIsStarted(true);
      setCurrentQuestionIndex(0);
      setShowConfirmDialog(false);
    } catch (err) {
      console.error(err);
      setTimeLeft(DEFAULT_QUIZ_DURATION_SECONDS);
      setShowInstructions(false);
      setIsStarted(true);
      setCurrentQuestionIndex(0);
      setShowConfirmDialog(false);
    }
  }, [isSubmitting, profile]);

  const handleSubmit = useCallback(async () => {
    if (hasSubmittedRef.current || isSubmitting) {
      return;
    }

    hasSubmittedRef.current = true;
    setIsSubmitting(true);
    setShowConfirmDialog(false);

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
      setIsSubmitting(false);
      setError(err.message || "Unable to submit quiz.");
    }
  }, [answers, isSubmitting, navigate, profile, questions]);

  useEffect(() => {
    if (!isStarted || loading || isSubmitting || questions.length === 0) {
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
  }, [handleSubmit, isStarted, isSubmitting, loading, questions.length]);

  const handleAnswerChange = (questionId, value) => {
    if (isSubmitting || !isStarted) {
      return;
    }

    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0 && !isSubmitting) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1 && !isSubmitting) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const formatTime = (value) => {
    const minutes = String(Math.floor(value / 60)).padStart(2, "0");
    const seconds = String(value % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const answeredCount = Object.values(answers).filter(Boolean).length;
  const totalQuestions = questions.length;
  const remainingCount = Math.max(totalQuestions - answeredCount, 0);
  const currentQuestion = questions[currentQuestionIndex];
  const currentQuestionNumber = totalQuestions > 0 ? currentQuestionIndex + 1 : 0;
  const progressPercent =
    totalQuestions > 0 ? (currentQuestionNumber / totalQuestions) * 100 : 0;
  const timeIsUrgent = timeLeft < 60;

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

  if (showInstructions) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="w-full max-w-3xl rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-slate-800">Quiz Instructions</h1>
          <p className="mt-3 text-slate-600">
            Please read the instructions carefully before you begin.
          </p>

          <ul className="mt-6 space-y-3 text-slate-700">
            <li>• Read all questions carefully before selecting your answer.</li>
            <li>• You can attempt the quiz only once.</li>
            <li>• Do not refresh or close the browser during the quiz.</li>
            <li>• Once submitted, your answers cannot be changed.</li>
            <li>• Ensure your internet connection is stable.</li>
            <li>• The timer will begin as soon as you start the quiz.</li>
          </ul>

          <label className="mt-8 flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={agreedToInstructions}
              onChange={() => setAgreedToInstructions((prev) => !prev)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600"
            />
            <span>I have read and understood all the instructions.</span>
          </label>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => navigate("/applicant")}
              className="rounded-2xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Back to Dashboard
            </button>
            <button
              type="button"
              onClick={handleStartQuiz}
              disabled={!agreedToInstructions || isSubmitting}
              className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700">
              Question {currentQuestionNumber} of {totalQuestions}
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 md:w-64">
              <div
                className="h-2 rounded-full bg-blue-600 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
              <p className="font-semibold">Answered: {answeredCount} / {totalQuestions}</p>
              <p className="text-slate-500">Remaining: {remainingCount}</p>
            </div>
            <div
              className={`rounded-2xl border px-4 py-3 text-center ${
                timeIsUrgent
                  ? "border-red-300 bg-red-50 text-red-700"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              <p className="text-sm font-semibold">Time Remaining</p>
              <p className="text-2xl font-bold">{formatTime(timeLeft)}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_220px]">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Quiz</h1>
            <p className="mt-2 text-sm text-slate-600">
              Role: {profile?.roles?.name || profile?.application_role_id}
            </p>

            {currentQuestion && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="font-semibold text-slate-800">
                  {currentQuestionNumber}. {currentQuestion.question}
                </p>

                <div className="mt-4 grid gap-3">
                  {["A", "B", "C", "D"].map((optionKey) => {
                    const optionValue = currentQuestion[`option_${optionKey.toLowerCase()}`];
                    const isSelected = answers[currentQuestion.id] === optionKey;

                    return (
                      <label
                        key={optionKey}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-slate-700 ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-300 bg-white"
                        } ${isSubmitting ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          value={optionKey}
                          checked={isSelected}
                          onChange={() => handleAnswerChange(currentQuestion.id, optionKey)}
                          disabled={isSubmitting}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="font-medium">{optionKey}.</span>
                        <span>{optionValue}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0 || isSubmitting}
                className="rounded-2xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmDialog(true)}
                disabled={isSubmitting}
                className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={currentQuestionIndex === questions.length - 1 || isSubmitting}
                className="rounded-2xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Question Navigation
            </h2>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {questions.map((question, index) => {
                const isCurrent = index === currentQuestionIndex;
                const isAnswered = Boolean(answers[question.id]);

                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => {
                      if (!isSubmitting) {
                        setCurrentQuestionIndex(index);
                      }
                    }}
                    disabled={isSubmitting}
                    className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                      isCurrent
                        ? "border-blue-600 bg-blue-600 text-white"
                        : isAnswered
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-800">Submit Quiz?</h2>
            <p className="mt-3 text-slate-600">Answered: {answeredCount} / {totalQuestions}</p>
            <p className="mt-2 text-slate-600">Remaining time: {formatTime(timeLeft)}</p>
            <p className="mt-4 text-slate-600">Are you sure you want to submit your quiz?</p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmDialog(false)}
                disabled={isSubmitting}
                className="rounded-2xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={isSubmitting}
                className="rounded-2xl bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
