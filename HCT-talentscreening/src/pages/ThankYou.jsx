import { useNavigate } from "react-router-dom";
import { logoutUser } from "../services/authService";
import { showError } from "../utils/toast";

export default function ThankYou() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/");
    } catch (err) {
      console.error(err);
      showError(err.message || "Unable to log out.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800">Thank You!</h1>
        <p className="mt-4 text-slate-600">
          Your assessment has been submitted successfully.
        </p>
        <p className="mt-2 text-slate-600">
          Our HR team will review your assessment.
        </p>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
