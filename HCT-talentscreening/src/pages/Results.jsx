import { useEffect, useState } from "react";
import { FileText, Search } from "lucide-react";
import EmptyState from "../components/EmptyState";
import Card from "../components/Card";
import { TableSkeleton } from "../components/Skeleton";
import { getSubmissions } from "../services/submissionService";
import LoadingSpinner from "../components/LoadingSpinner";
import { showError, showSuccess } from "../utils/toast";

export default function Results() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sortBy, setSortBy] = useState("date-newest");
  const [isExporting, setIsExporting] = useState(false);

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

  const getPercentage = (submission) => {
    const score = Number(submission.score) || 0;
    const total = Number(submission.total_questions) || 0;
    return total > 0 ? Math.round((score / total) * 100) : 0;
  };

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

  const sortedSubmissions = [...filteredSubmissions].sort((first, second) => {
    if (sortBy === "name-asc") return getApplicantName(first).localeCompare(getApplicantName(second));
    if (sortBy === "name-desc") return getApplicantName(second).localeCompare(getApplicantName(first));
    if (sortBy === "score-high") return Number(second.score) - Number(first.score);
    if (sortBy === "score-low") return Number(first.score) - Number(second.score);
    if (sortBy === "date-oldest") return new Date(first.created_at) - new Date(second.created_at);
    return new Date(second.created_at) - new Date(first.created_at);
  });

  const handleClearFilters = () => {
    setSearch("");
    setRoleFilter("");
  };

  const escapeCsvValue = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

  const handleExportCsv = () => {
    if (isExporting) return;

    setIsExporting(true);
    window.requestAnimationFrame(() => {
      try {
        const rows = sortedSubmissions.map((submission) => [
          getApplicantName(submission),
          getApplicantEmail(submission),
          getRoleName(submission),
          submission.score,
          submission.total_questions,
          `${getPercentage(submission)}%`,
          formatDate(submission.created_at),
        ]);
        const csv = [
          ["Applicant Name", "Email", "Applied Role", "Score", "Total Questions", "Percentage", "Submitted Date"],
          ...rows,
        ].map((row) => row.map(escapeCsvValue).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "quiz-results.csv";
        link.click();
        window.URL.revokeObjectURL(url);
        showSuccess("Results exported successfully.");
      } catch (err) {
        console.error(err);
        showError("Unable to export results.");
      } finally {
        setIsExporting(false);
      }
    });
  };

  return (
    <div className="space-y-6">
        <Card>
          <h1 className="text-2xl font-bold text-slate-800">Quiz Submissions</h1>
          <p className="mt-2 text-slate-600">
            Review all submitted quiz results in one place.
          </p>
        </Card>

        <Card>
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
            <div className="md:w-52">
              <label className="block text-sm font-medium text-slate-700">Sort Results</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
                <option value="score-high">Score: High to Low</option>
                <option value="score-low">Score: Low to High</option>
                <option value="date-newest">Date: Newest First</option>
                <option value="date-oldest">Date: Oldest First</option>
              </select>
            </div>
            <button
              type="button"
              onClick={handleClearFilters}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Clear Filters
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={isExporting || sortedSubmissions.length === 0}
              className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {isExporting && <LoadingSpinner className="mr-2 align-text-bottom" />}
              {isExporting ? "Exporting..." : "Export CSV"}
            </button>
          </div>

          {loading ? (
            <TableSkeleton columns={6} rows={5} />
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : submissions.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No submissions found"
              description="Submitted quiz results will appear here."
            />
          ) : sortedSubmissions.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No submissions match your search."
              description="Try changing your search term or selected filter."
            />
          ) : (
            <div className="overflow-x-auto">
            <table className="min-w-max w-full text-left text-sm text-slate-700">
              <thead className="sticky top-0 z-10 bg-white shadow-sm">
                <tr>
                  <th className="border-b px-4 py-3 font-medium">Applicant Name</th>
                  <th className="border-b px-4 py-3 font-medium">Email</th>
                  <th className="border-b px-4 py-3 font-medium">Applied Role</th>
                  <th className="border-b px-4 py-3 font-medium">Score</th>
                  <th className="border-b px-4 py-3 font-medium">Percentage</th>
                  <th className="border-b px-4 py-3 font-medium">Submitted Date</th>
                </tr>
              </thead>
              <tbody>
                {sortedSubmissions.map((submission) => {
                  const applicantName = getApplicantName(submission);
                  const email = getApplicantEmail(submission);
                  const roleName = getRoleName(submission);

                  return (
                    <tr key={submission.id} className="odd:bg-slate-50 hover:bg-slate-100">
                      <td className="border-b px-4 py-4">{applicantName}</td>
                      <td className="border-b px-4 py-4">{email}</td>
                      <td className="border-b px-4 py-4">{roleName}</td>
                      <td className="border-b px-4 py-4">{submission.score} / {submission.total_questions}</td>
                      <td className="border-b px-4 py-4">{getPercentage(submission)}%</td>
                      <td className="border-b px-4 py-4">{formatDate(submission.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          )}
        </Card>
    </div>
  );
}
