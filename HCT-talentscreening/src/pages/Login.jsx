import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

export default function Login() {
  const navigate = useNavigate();
  // Controlled form data for login
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Submit handler calls auth service and redirects based on role

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const profile = await loginUser(formData);

      // Redirect user to the appropriate dashboard based on role
      if (profile.app_role === "hr") {
        navigate("/hr");
      } else {
        navigate("/applicant");
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-slate-800">
          HCT Talent Screening
        </h1>

        <p className="text-center text-slate-500 mt-2 mb-8">Login to continue</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="********"
              required
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
          >
            Login
          </button>

          <div className="text-center mt-4">
            <p className="text-sm text-slate-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                Register here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}