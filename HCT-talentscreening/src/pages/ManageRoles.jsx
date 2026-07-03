import { useEffect, useState } from "react";
import { createRole, deleteRole, getRoles, updateRole } from "../services/roleService";

export default function ManageRoles() {
  // List of roles fetched from backend
  const [roles, setRoles] = useState([]);
  // Loading indicator for initial and refresh fetches
  const [loading, setLoading] = useState(true);
  // Error message for UI display
  const [error, setError] = useState("");
  // Controlled form state for create/edit role
  const [formData, setFormData] = useState({ name: "", description: "" });
  // Currently editing role id (null when creating)
  const [editingRoleId, setEditingRoleId] = useState(null);

  // On mount: load roles from the service
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

  // Controlled input change for the create/edit form
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Submit handler: create a new role or update an existing one
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingRoleId) {
        await updateRole(editingRoleId, formData);
      } else {
        await createRole(formData);
      }

      setFormData({ name: "", description: "" });
      setEditingRoleId(null);
      await refreshRoles();
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to save role.");
    }
  };

  // Prepare the form to edit a selected role
  const handleEdit = (role) => {
    setEditingRoleId(role.id);
    setFormData({ name: role.name, description: role.description || "" });
    setError("");
  };

  // Delete a role with user confirmation and refresh the list
  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this role?");
    if (!confirmed) {
      return;
    }

    try {
      await deleteRole(id);
      await refreshRoles();
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to delete role.");
    }
  };

  // Cancel editing and reset form state
  const handleCancelEdit = () => {
    setEditingRoleId(null);
    setFormData({ name: "", description: "" });
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h1 className="text-2xl font-bold text-slate-800">Manage Roles</h1>
          <p className="mt-2 text-slate-600">Add, update, or remove roles used by applicants.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
          <div className="bg-white rounded-2xl shadow p-6">
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

          <div className="bg-white rounded-2xl shadow p-6 overflow-x-auto">
            <h2 className="text-xl font-semibold text-slate-800">Role List</h2>

            {loading ? (
              <p className="mt-4 text-slate-500">Loading roles...</p>
            ) : roles.length === 0 ? (
              <p className="mt-4 text-slate-500">No roles found.</p>
            ) : (
              <table className="mt-4 w-full text-left text-sm text-slate-700">
                <thead>
                  <tr>
                    <th className="border-b px-4 py-3 font-medium">Name</th>
                    <th className="border-b px-4 py-3 font-medium">Description</th>
                    <th className="border-b px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => (
                    <tr key={role.id} className="odd:bg-slate-50">
                      <td className="border-b px-4 py-3">{role.name}</td>
                      <td className="border-b px-4 py-3">{role.description}</td>
                      <td className="border-b px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(role)}
                            className="rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(role.id)}
                            className="rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
