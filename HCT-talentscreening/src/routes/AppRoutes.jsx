import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import ApplicantDashboard from "../pages/applicant/Dashboard";
import HRDashboard from "../pages/hr/Dashboard";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/applicant" element={<ApplicantDashboard />} />
        <Route path="/hr" element={<HRDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}