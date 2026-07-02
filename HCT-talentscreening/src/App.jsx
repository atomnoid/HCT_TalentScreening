import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ApplicantDashboard from "./pages/ApplicantDashboard";
import HRDashboard from "./pages/HRDashboard";
import Quiz from "./pages/Quiz";
import Results from "./pages/Results";
import ThankYou from "./pages/ThankYou";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/applicant" element={<ApplicantDashboard />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/results" element={<Results />} />
        <Route path="/thank-you" element={<ThankYou />} />

        <Route path="/hr" element={<HRDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;