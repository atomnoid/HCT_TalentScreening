import { Link } from "react-router-dom";
import { useState } from "react";


export default function Register() {
const [formData, setFormData] = useState({
  fullName: "",
  email: "",
  phone: "",
  password: "",
  role: "",
  portfolio: "",
});

const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};

const handleSubmit = (e) => {
  e.preventDefault();

  console.log(formData);
};

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
          {/* Full Name */}
          <div>
            <label className="block mb-2 font-medium">Full Name</label>

            <input
              type="text"
              name="fullName"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Email */}

          <div>
            <label className="block mb-2 font-medium">Email</label>

            <input
              type="email"
              name="email"
              placeholder="john@gmail.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Phone */}

          <div>
            <label className="block mb-2 font-medium">Phone Number</label>

            <input
              type="tel"
              name="phone"
              placeholder="+91 9876543210"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Password */}

          <div>
            <label className="block mb-2 font-medium">Password</label>

            <input
              type="password"
              name="password"
              placeholder="********"
              value={formData.password}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Role */}

          <div>
            <label className="block mb-2 font-medium">
              Applying For
            </label>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Loading Roles...</option>
            </select>
          </div>

          {/* Portfolio */}

          <div>
            <label className="block mb-2 font-medium">
              Portfolio / LinkedIn URL
            </label>

            <input
              type="url"
              name="portfolio"
              placeholder="https://linkedin.com/in/username"
              value={formData.portfolio}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Button */}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
          >
            Register
          </button>
        </form>

        <p className="text-center mt-6 text-slate-600">
          Already have an account?{" "}
          <Link
            to="/"
            className="text-blue-600 hover:underline font-medium"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}