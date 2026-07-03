import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentProfile, logoutUser } from "../services/authService";
import { getSubmissionByApplicant } from "../services/submissionService";

export default function ApplicantDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // On mount: load the user's profile and check for an existing submission
  useEffect(() => {
    async function loadProfile() {
      try {
        const profileData = await getCurrentProfile();
        setProfile(profileData);

        const existingSubmission = await getSubmissionByApplicant(profileData.id);
        setSubmission(existingSubmission);
      } catch (err) {
        console.error(err);
        setError(err.message || "Unable to load profile.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  // Logout and redirect to the login page
  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // Navigate to the quiz page when user starts the assessment
  const handleStartQuiz = () => {
    navigate("/quiz");
  };

  const roleName =
    profile?.roles?.name || profile?.application_role_id || "Unknown role";

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8">
        {loading ? (
          <p className="text-center text-slate-500">Loading profile...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-slate-800">
              Welcome, {profile.full_name}
            </h1>
            <p className="mt-3 text-slate-600">
              Applied role: <span className="font-medium">{roleName}</span>
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={handleStartQuiz}
                disabled={Boolean(submission)}
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  submission
                    ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {submission ? "Quiz Already Submitted" : "Start Quiz"}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 py-3 rounded-lg font-semibold transition"
              >
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}