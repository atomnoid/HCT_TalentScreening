import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentProfile } from "../services/authService";

export default function ProtectedRoute({ children, requiredRole }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const profile = await getCurrentProfile();

        if (profile.app_role === requiredRole) {
          setAuthorized(true);
        } else {
          const redirectPath = profile.app_role === "hr" ? "/hr" : "/applicant";
          navigate(redirectPath);
        }
      } catch (err) {
        navigate("/");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [navigate, requiredRole]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return children;
}
