import { createBrowserRouter, RouterProvider } from "react-router-dom";

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
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import HRLayout from "./components/layout/HRLayout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/applicant",
    element: (
      <ProtectedRoute requiredRole="applicant">
        <ApplicantDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/quiz",
    element: (
      <ProtectedRoute requiredRole="applicant">
        <Quiz />
      </ProtectedRoute>
    ),
  },
  {
    path: "/thank-you",
    element: (
      <ProtectedRoute requiredRole="applicant">
        <ThankYou />
      </ProtectedRoute>
    ),
  },
  {
    element: (
      <ProtectedRoute requiredRole="hr">
        <HRLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/hr",
        element: <HRDashboard />,
      },
      {
        path: "/results",
        element: <Results />,
      },
      {
        path: "/manage-roles",
        element: <ManageRoles />,
      },
      {
        path: "/manage-questions",
        element: <ManageQuestions />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
