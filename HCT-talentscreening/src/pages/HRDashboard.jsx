import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ClipboardList, ShieldCheck, CheckSquare, Sparkles, Inbox } from "lucide-react";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import { getRoles } from "../services/roleService";
import { getQuestions } from "../services/questionService";
import { getSubmissions } from "../services/submissionService";
import { getApplicants } from "../services/authService";

function StatCard({ title, value, icon: Icon, colorClass, loading }) {
  return (
    <Card className="relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-4">
        <div className={`rounded-xl p-3 ${colorClass}`}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 truncate">{title}</p>
          <h4 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">
            {loading ? <span className="animate-pulse">...</span> : value}
          </h4>
        </div>
      </div>
    </Card>
  );
}

export default function HRDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalRoles: 0,
    activeRoles: 0,
    totalQuestions: 0,
    totalSubmissions: 0,
    totalApplicants: 0,
  });
  const [recentSubmissions, setRecentSubmissions] = useState([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [roles, questions, submissions, applicants] = await Promise.all([
          getRoles(),
          getQuestions(),
          getSubmissions(),
          getApplicants(),
        ]);

        setStats({
          totalRoles: roles.length,
          activeRoles: roles.filter((role) => role.is_active !== false).length,
          totalQuestions: questions.length,
          totalSubmissions: submissions.length,
          totalApplicants: applicants.length,
        });

        setRecentSubmissions(submissions.slice(0, 5));
      } catch (err) {
        console.error("Dashboard load error:", err);
        setError("Unable to load dashboard details.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const getApplicantProfile = (submission) =>
    Array.isArray(submission.profiles) ? submission.profiles[0] : submission.profiles;

  const getApplicantName = (submission) =>
    getApplicantProfile(submission)?.full_name || "Unknown";

  const getRoleName = (submission) => submission.roles?.name || "Unknown";

  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white border-0 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome, HR Manager!</h2>
            <p className="mt-1.5 text-blue-100 text-sm">
              Review stats, manage assessment roles and questions, or export candidate submissions.
            </p>
          </div>
          <div className="flex items-center gap-1.5 self-start rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md">
            <Sparkles size={14} className="text-amber-300 animate-spin-slow" />
            <span>Admin Control Panel</span>
          </div>
        </div>
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-white/5" />
        <div className="absolute bottom-0 left-1/3 -mb-20 h-40 w-40 rounded-full bg-white/5" />
      </Card>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Roles"
          value={stats.totalRoles}
          icon={Users}
          colorClass="bg-blue-50 text-blue-600"
          loading={loading}
        />
        <StatCard
          title="Active Roles"
          value={stats.activeRoles}
          icon={CheckSquare}
          colorClass="bg-emerald-50 text-emerald-600"
          loading={loading}
        />
        <StatCard
          title="Total Questions"
          value={stats.totalQuestions}
          icon={ClipboardList}
          colorClass="bg-indigo-50 text-indigo-600"
          loading={loading}
        />
        <StatCard
          title="Total Submissions"
          value={stats.totalSubmissions}
          icon={ShieldCheck}
          colorClass="bg-purple-50 text-purple-600"
          loading={loading}
        />
        <StatCard
          title="Total Applicants"
          value={stats.totalApplicants}
          icon={Users}
          colorClass="bg-amber-50 text-amber-600"
          loading={loading}
        />
      </div>

      {/* Main Section */}
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        {/* Quick Actions Card */}
        <Card className="flex flex-col h-full justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
            <p className="mt-1 text-sm text-slate-500">Access administrative workflows quickly.</p>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => navigate("/manage-roles")}
              className="flex w-full items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3 font-semibold text-blue-700 transition hover:bg-blue-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                <Users size={18} aria-hidden="true" />
              </div>
              <span>Create Role</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/manage-questions")}
              className="flex w-full items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-3 font-semibold text-indigo-700 transition hover:bg-indigo-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
                <ClipboardList size={18} aria-hidden="true" />
              </div>
              <span>Add Question</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/results")}
              className="flex w-full items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 font-semibold text-emerald-700 transition hover:bg-emerald-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
                <ShieldCheck size={18} aria-hidden="true" />
              </div>
              <span>View Results</span>
            </button>
          </div>
        </Card>

        {/* Recent Activity Card */}
        <Card className="h-full">
          <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
          <p className="mt-1 text-sm text-slate-500">Latest candidate quiz submissions.</p>

          <div className="mt-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="flex items-center justify-between py-2 animate-pulse">
                    <div className="space-y-2">
                      <div className="h-4 w-32 rounded bg-slate-200" />
                      <div className="h-3 w-48 rounded bg-slate-200" />
                    </div>
                    <div className="h-6 w-16 rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            ) : recentSubmissions.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No submissions yet"
                description="When applicants complete their screening quizzes, their results will show up here."
                className="py-8 bg-slate-50/30"
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {recentSubmissions.map((sub) => {
                  const applicantName = getApplicantName(sub);
                  const roleName = getRoleName(sub);
                  const score = sub.score;
                  const total = sub.total_questions;
                  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
                  const dateStr = formatDate(sub.submitted_at || sub.created_at);

                  return (
                    <div
                      key={sub.id}
                      className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{applicantName}</p>
                        <p className="text-sm text-slate-500 truncate">
                          Applied for: <span className="font-medium text-slate-700">{roleName}</span>
                        </p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                        <div className="text-left sm:text-right">
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                            Score: {score} / {total} ({percentage}%)
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">{dateStr}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
