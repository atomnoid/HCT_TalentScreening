import { useNavigate } from "react-router-dom";
import { logoutUser } from "../services/authService";

// Simple HR dashboard with four actions: manage roles/questions, view results, logout
export default function HRDashboard() {
  const navigate = useNavigate();

  // Logout handler reuses the existing authService.logoutUser function
  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="bg-white p-12 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">HR Dashboard</h1>
        <p className="text-slate-600 mb-8">Welcome HR</p>

        <div className="space-y-4">
          <button
            onClick={() => navigate("/manage-roles")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded"
          >
            Manage Roles
          </button>

          <button
            onClick={() => navigate("/manage-questions")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded"
          >
            Manage Questions
          </button>

          <button
            onClick={() => navigate("/results")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded"
          >
            View Results
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}