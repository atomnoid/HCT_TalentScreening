import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ClipboardList, LayoutDashboard, LogOut, Menu, ShieldCheck, UsersRound, X } from "lucide-react";
import { getCurrentProfile, logoutUser } from "../../services/authService";
import { showError } from "../../utils/toast";

const navigationItems = [
  { label: "Dashboard", path: "/hr", icon: LayoutDashboard },
  { label: "Manage Roles", path: "/manage-roles", icon: UsersRound },
  { label: "Manage Questions", path: "/manage-questions", icon: ClipboardList },
  { label: "Results", path: "/results", icon: ShieldCheck },
];

function NavigationLinks({ onNavigate }) {
  return (
    <nav className="space-y-1" aria-label="HR navigation">
      {navigationItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/hr"}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`
            }
          >
            <Icon size={19} aria-hidden="true" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export default function HRLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userName, setUserName] = useState("HR User");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPage = navigationItems.find((item) => item.path === location.pathname);
  const pageTitle = currentPage?.label || "HR Portal";

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getCurrentProfile();
        setUserName(profile.full_name || "HR User");
      } catch (err) {
        console.error(err);
      }
    }

    loadProfile();
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsDrawerOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    try {
      await logoutUser();
      navigate("/");
    } catch (err) {
      console.error(err);
      showError(err.message || "Unable to log out.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white p-4 lg:block">
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 px-3 py-3">
            <div className="rounded-lg bg-blue-600 p-2 text-white">
              <ShieldCheck size={20} aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Talent Screening</p>
              <p className="text-xs text-slate-500">HR Portal</p>
            </div>
          </div>

          <div className="mt-8 flex-1">
            <NavigationLinks />
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut size={19} aria-hidden="true" />
            <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
          </button>
        </div>
      </aside>

      {isDrawerOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setIsDrawerOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
        />
      )}

      <aside
        aria-label="Mobile navigation"
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-white p-4 shadow-xl transition-transform duration-200 lg:hidden ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-3 py-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-600 p-2 text-white">
                <ShieldCheck size={20} aria-hidden="true" />
              </div>
              <span className="font-semibold text-slate-900">Talent Screening</span>
            </div>
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setIsDrawerOpen(false)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          <div className="mt-8 flex-1">
            <NavigationLinks onNavigate={() => setIsDrawerOpen(false)} />
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut size={19} aria-hidden="true" />
            <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
          </button>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="Open navigation menu"
                onClick={() => setIsDrawerOpen(true)}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden"
              >
                <Menu size={22} aria-hidden="true" />
              </button>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 sm:hidden">Talent Screening</p>
                <h1 className="truncate text-lg font-semibold text-slate-900">{pageTitle}</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-slate-600 sm:block">{userName}</span>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
