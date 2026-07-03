import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentProfile } from "../services/authService";

// Wrapper component used to protect routes based on authentication + role.
// - `requiredRole` should be either "applicant" or "hr".
export default function ProtectedRoute({ children, requiredRole }) {
  const navigate = useNavigate();
  // Loading while we verify session and profile
  const [loading, setLoading] = useState(true);
  // Authorized toggles when the user role matches requiredRole
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Check current profile and redirect accordingly
    async function checkAuth() {
      try {
        const profile = await getCurrentProfile();

        // If role matches, allow rendering of children
        if (profile.app_role === requiredRole) {
          setAuthorized(true);
        } else {
          // If role doesn't match, send user to their dashboard
          const redirectPath = profile.app_role === "hr" ? "/hr" : "/applicant";
          navigate(redirectPath);
        }
      } catch (err) {
        // No session or error -> go to login
        navigate("/");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [navigate, requiredRole]);

  if (loading) {
    // Simple loading state while we check the session
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!authorized) {
    // If not authorized, render nothing
    return null;
  }

  // Authorized: render protected children
  return children;
}
