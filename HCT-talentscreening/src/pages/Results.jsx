import { useEffect, useState } from "react";
import { getSubmissions } from "../services/submissionService";

export default function Results() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSubmissions() {
      try {
        const data = await getSubmissions();
        setSubmissions(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Unable to load submissions.");
      } finally {
        setLoading(false);
      }
    }

    loadSubmissions();
  }, []);


  // Convert stored timestamp to a human readable local string for display
  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h1 className="text-2xl font-bold text-slate-800">Quiz Submissions</h1>
          <p className="mt-2 text-slate-600">
            Review all submitted quiz results in one place.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 overflow-x-auto">
          {loading ? (
            <p className="text-slate-600">Loading submissions...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : submissions.length === 0 ? (
            <p className="text-slate-600">No submissions found.</p>
          ) : (
            <table className="min-w-full text-left text-sm text-slate-700">
              <thead>
                <tr>
                  <th className="border-b px-4 py-3 font-medium">Applicant Name</th>
                  <th className="border-b px-4 py-3 font-medium">Email</th>
                  <th className="border-b px-4 py-3 font-medium">Applied Role</th>
                  <th className="border-b px-4 py-3 font-medium">Score</th>
                  <th className="border-b px-4 py-3 font-medium">Total Questions</th>
                  <th className="border-b px-4 py-3 font-medium">Submitted Date</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => {
                  const applicantName = submission.profiles?.full_name || "Unknown";
                  const email = submission.profiles?.email || "Unknown";
                  const roleName = submission.roles?.name || "Unknown";

                  return (
                    <tr key={submission.id} className="odd:bg-slate-50">
                      <td className="border-b px-4 py-4">{applicantName}</td>
                      <td className="border-b px-4 py-4">{email}</td>
                      <td className="border-b px-4 py-4">{roleName}</td>
                      <td className="border-b px-4 py-4">{submission.score}</td>
                      <td className="border-b px-4 py-4">{submission.total_questions}</td>
                      <td className="border-b px-4 py-4">{formatDate(submission.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
