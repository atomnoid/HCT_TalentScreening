import { useEffect, useState } from "react";
import { Compass } from "lucide-react";
import { Link } from "react-router-dom";
import { getCurrentProfile } from "../services/authService";

export default function NotFound() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getCurrentProfile().then(setProfile).catch(() => setProfile(null));
  }, []);

  const dashboardPath = profile?.app_role === "hr" ? "/hr" : "/applicant";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto w-fit rounded-full bg-blue-50 p-4 text-blue-600"><Compass size={32} aria-hidden="true" /></div>
        <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-blue-600">404</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-3 text-slate-600">The page you are looking for does not exist or may have moved.</p>
        <Link to={profile ? dashboardPath : "/"} className="mt-6 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700">
          {profile ? "Back to Dashboard" : "Back to Login"}
        </Link>
      </div>
    </div>
  );
}
