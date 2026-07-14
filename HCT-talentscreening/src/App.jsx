import { BrowserRouter, Routes, Route } from "react-router-dom";

// Top-level routes for the application. Protected routes use ProtectedRoute wrapper.
import Login from "./pages/Login";
import Register from "./pages/Register";
import ApplicantDashboard from "./pages/ApplicantDashboard";
import HRDashboard from "./pages/HRDashboard";
import Quiz from "./pages/Quiz";
import Results from "./pages/Results";
import ThankYou from "./pages/ThankYou";
import ManageRoles from "./pages/ManageRoles";
import ManageQuestions from "./pages/ManageQuestions";
import ProtectedRoute from "./components/ProtectedRoute";
import HRLayout from "./components/layout/HRLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/applicant"
          element={
            <ProtectedRoute requiredRole="applicant">
              <ApplicantDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz"
          element={
            <ProtectedRoute requiredRole="applicant">
              <Quiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/thank-you"
          element={
            <ProtectedRoute requiredRole="applicant">
              <ThankYou />
            </ProtectedRoute>
          }
        />

        <Route
          element={
            <ProtectedRoute requiredRole="hr">
              <HRLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/hr" element={<HRDashboard />} />
          <Route path="/results" element={<Results />} />
          <Route path="/manage-roles" element={<ManageRoles />} />
          <Route path="/manage-questions" element={<ManageQuestions />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
