import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ApplicantDashboard from "./pages/ApplicantDashboard";
import HRDashboard from "./pages/HRDashboard";

function App() {
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

export default App;