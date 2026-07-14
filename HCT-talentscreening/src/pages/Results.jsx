import { useEffect, useState } from "react";
import { getSubmissions } from "../services/submissionService";

export default function Results() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

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

  const getApplicantProfile = (submission) =>
    Array.isArray(submission.profiles) ? submission.profiles[0] : submission.profiles;

  const getApplicantName = (submission) =>
    getApplicantProfile(submission)?.full_name || "Unknown";

  const getApplicantEmail = (submission) =>
    getApplicantProfile(submission)?.email || "Unknown";

  const getRoleName = (submission) => submission.roles?.name || "Unknown";

  const normalizedSearch = search.trim().toLowerCase();
  const availableRoles = [...new Set(submissions.map(getRoleName))].sort((firstRole, secondRole) =>
    firstRole.localeCompare(secondRole)
  );
  const filteredSubmissions = submissions.filter((submission) => {
    const applicantName = getApplicantName(submission).toLowerCase();
    const applicantEmail = getApplicantEmail(submission).toLowerCase();
    const roleName = getRoleName(submission);
    const matchesSearch =
      applicantName.includes(normalizedSearch) || applicantEmail.includes(normalizedSearch);
    const matchesRole = !roleFilter || roleName.toLowerCase() === roleFilter.toLowerCase();

    return matchesSearch && matchesRole;
  });

  const handleClearFilters = () => {
    setSearch("");
    setRoleFilter("");
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
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700">Search Applicants</label>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="md:w-56">
              <label className="block text-sm font-medium text-slate-700">Filter by Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">All Roles</option>
                {availableRoles.map((roleName) => (
                  <option key={roleName} value={roleName}>
                    {roleName}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleClearFilters}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Clear Filters
            </button>
          </div>

          {loading ? (
            <p className="text-slate-600">Loading submissions...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : submissions.length === 0 ? (
            <p className="text-slate-600">No submissions found.</p>
          ) : filteredSubmissions.length === 0 ? (
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
                {filteredSubmissions.map((submission) => {
                  const applicantName = getApplicantName(submission);
                  const email = getApplicantEmail(submission);
                  const roleName = getRoleName(submission);

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
