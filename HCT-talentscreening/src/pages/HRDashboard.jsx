import { useNavigate } from "react-router-dom";
import Card from "../components/Card";

// Simple HR dashboard with four actions: manage roles/questions, view results, logout
export default function HRDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-2xl font-bold text-slate-900">HR Dashboard</h2>
        <p className="mt-2 text-slate-600">Manage roles, questions, and assessment results.</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => navigate("/manage-roles")}
            className="rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Manage Roles
          </button>

          <button
            type="button"
            onClick={() => navigate("/manage-questions")}
            className="rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Manage Questions
          </button>

          <button
            type="button"
            onClick={() => navigate("/results")}
            className="rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            View Results
          </button>
        </div>
      </Card>
    </div>
  );
}
