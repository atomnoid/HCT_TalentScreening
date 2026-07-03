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
          path="/hr"
          element={
            <ProtectedRoute requiredRole="hr">
              <HRDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/results"
          element={
            <ProtectedRoute requiredRole="hr">
              <Results />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-roles"
          element={
            <ProtectedRoute requiredRole="hr">
              <ManageRoles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-questions"
          element={
            <ProtectedRoute requiredRole="hr">
              <ManageQuestions />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;