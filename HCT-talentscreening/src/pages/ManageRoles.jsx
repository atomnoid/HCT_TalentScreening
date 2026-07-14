import { useEffect, useState } from "react";
import { UsersRound } from "lucide-react";
import EmptyState from "../components/EmptyState";
import { createRole, deactivateRole, activateRole, getRoles, updateRole } from "../services/roleService";
import { showError, showSuccess } from "../utils/toast";

export default function ManageRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    quiz_duration_minutes: "15",
  });
  const [editingRoleId, setEditingRoleId] = useState(null);

  useEffect(() => {
    async function loadRoles() {
      try {
        const data = await getRoles();
        setRoles(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Unable to load roles.");
      } finally {
        setLoading(false);
      }
    }

    loadRoles();
  }, []);

  const refreshRoles = async () => {
    setLoading(true);
    try {
      const data = await getRoles();
      setRoles(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to refresh roles.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const parsedDuration = Number(formData.quiz_duration_minutes);

    if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
      setError("Quiz duration must be a positive number.");
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        quiz_duration_minutes: parsedDuration,
      };

      if (editingRoleId) {
        await updateRole(editingRoleId, payload);
      } else {
        await createRole(payload);
      }

      setFormData({ name: "", description: "", quiz_duration_minutes: "15" });
      setEditingRoleId(null);
      await refreshRoles();
      showSuccess(editingRoleId ? "Role updated successfully." : "Role created successfully.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to save role.");
      showError(err.message || "Unable to save role.");
    }
  };

  const handleEdit = (role) => {
    setEditingRoleId(role.id);
    setFormData({
      name: role.name,
      description: role.description || "",
      quiz_duration_minutes: role.quiz_duration_minutes ?? "15",
    });
    setError("");
  };

  const handleDeactivate = async (id) => {
    const confirmed = window.confirm("Deactivate this role?");
    if (!confirmed) {
      return;
    }

    try {
      await deactivateRole(id);
      await refreshRoles();
      showSuccess("Role deactivated successfully.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to deactivate role.");
      showError(err.message || "Unable to deactivate role.");
    }
  };

  const handleActivate = async (id) => {
    const confirmed = window.confirm("Activate this role?");
    if (!confirmed) {
      return;
    }

    try {
      await activateRole(id);
      await refreshRoles();
      showSuccess("Role activated successfully.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to activate role.");
      showError(err.message || "Unable to activate role.");
    }
  };

  const handleCancelEdit = () => {
    setEditingRoleId(null);
    setFormData({ name: "", description: "", quiz_duration_minutes: "15" });
    setError("");
  };

  return (
    <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-800">Manage Roles</h1>
          <p className="mt-2 text-slate-600">
            Add, update, or remove roles used by applicants.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800">
              {editingRoleId ? "Edit Role" : "Create Role"}
            </h2>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Quiz Duration (Minutes)
                </label>
                <input
                  type="number"
                  name="quiz_duration_minutes"
                  min="1"
                  value={formData.quiz_duration_minutes}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <p className="mt-2 text-sm text-slate-500">
                  This value controls how long the quiz stays active for this role.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
                >
                  {editingRoleId ? "Update Role" : "Create Role"}
                </button>
                {editingRoleId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="rounded-xl bg-slate-200 px-6 py-3 text-slate-700 transition hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800">Role List</h2>

            {loading ? (
              <p className="mt-4 text-slate-500">Loading roles...</p>
            ) : roles.length === 0 ? (
              <EmptyState
                icon={UsersRound}
                title="No roles found"
                description="Create a role to start organizing quizzes and applicants."
              />
            ) : (
              <table className="mt-4 min-w-max w-full text-left text-sm text-slate-700">
                <thead className="sticky top-0 z-10 bg-white shadow-sm">
                  <tr>
                    <th className="border-b px-4 py-3 font-medium">Name</th>
                    <th className="border-b px-4 py-3 font-medium">Description</th>
                    <th className="border-b px-4 py-3 font-medium">Duration</th>
                    <th className="border-b px-4 py-3 font-medium">Status</th>
                    <th className="border-b px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => {
                    const isActive = role.is_active !== false;
                    return (
                    <tr key={role.id} className={`odd:bg-slate-50 hover:bg-slate-100 ${!isActive ? "opacity-60" : ""}`}>
                        <td className="border-b px-4 py-3 font-medium">{role.name}</td>
                        <td className="border-b px-4 py-3">{role.description}</td>
                        <td className="border-b px-4 py-3">
                          {role.quiz_duration_minutes ?? "15"} min
                        </td>
                        <td className="border-b px-4 py-3">
                          {isActive ? (
                            <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md bg-red-100 px-2 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/20">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="border-b px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(role)}
                              className="rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                            >
                              Edit
                            </button>
                            {isActive ? (
                              <button
                                type="button"
                                onClick={() => handleDeactivate(role.id)}
                                className="rounded-lg bg-yellow-600 px-3 py-2 text-white hover:bg-yellow-700"
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleActivate(role.id)}
                                className="rounded-lg bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700"
                              >
                                Activate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
    </div>
  );
}
