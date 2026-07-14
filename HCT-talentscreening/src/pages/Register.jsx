import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getRoles } from "../services/roleService";
import { registerUser } from "../services/authService";
import { showError, showSuccess } from "../utils/toast";

export default function Register() {
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "",
    portfolio: "",
  });

  useEffect(() => {
    async function fetchRoles() {
      try {
        const data = await getRoles();
        // Register page should ONLY display active roles.
        setRoles(data.filter((role) => role.is_active !== false));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingRoles(false);
      }
    }

    fetchRoles();
  }, []);

  // Fetch roles once on mount to populate the "Applying For" selector

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await registerUser(formData);

      showSuccess("Registration successful.");

      navigate("/");
    } catch (err) {
      console.error(err);
      showError(err.message || "Unable to register.");
    }
  };

  // Register form submit: calls authService.registerUser then redirects to login

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-slate-800">
          HCT Talent Screening
        </h1>

        <p className="text-center text-slate-500 mt-2 mb-8">
          Create your applicant account
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="text-sm text-slate-500"><span className="text-red-600">*</span> Required fields</p>
          <div>
            <label className="block mb-2 font-medium">Full Name <span className="text-red-600">*</span></label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              required
              aria-required="true"
              className="w-full rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 invalid:border-red-500 invalid:ring-2 invalid:ring-red-100"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Email <span className="text-red-600">*</span></label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              required
              aria-required="true"
              className="w-full rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 invalid:border-red-500 invalid:ring-2 invalid:ring-red-100"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Phone Number <span className="text-red-600">*</span></label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 9876543210"
              required
              aria-required="true"
              className="w-full rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 invalid:border-red-500 invalid:ring-2 invalid:ring-red-100"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Password <span className="text-red-600">*</span></label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="********"
                required
                aria-required="true"
                className="w-full rounded-lg border border-slate-300 p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 invalid:border-red-500 invalid:ring-2 invalid:ring-red-100"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700 focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium">Applying For <span className="text-red-600">*</span></label>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              aria-required="true"
              className="w-full rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 invalid:border-red-500 invalid:ring-2 invalid:ring-red-100"
            >
              <option value="">
                {loadingRoles ? "Loading roles..." : "Select a Role"}
              </option>

              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Portfolio / LinkedIn URL
            </label>

            <input
              type="url"
              name="portfolio"
              value={formData.portfolio}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/username"
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
          >
            Register
          </button>
        </form>

        <p className="text-center mt-6 text-slate-600">
          Already have an account?{" "}
          <Link to="/" className="text-blue-600 font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
